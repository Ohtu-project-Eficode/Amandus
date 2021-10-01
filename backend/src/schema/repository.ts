/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  cloneRepository,
  getCurrentBranchName,
  getCurrentCommitMessage,
  saveChanges,
  getLocalBranches,
  switchCurrentBranch,
  pullNewestChanges,
} from '../services/git'
import { existsSync, readFileSync } from 'fs'
import readRecursive from 'recursive-readdir'
import { ForbiddenError, ApolloError } from 'apollo-server'
import { relative } from 'path'
import { AppContext } from '../types/user'
import { BranchSwitchArgs, SaveArgs } from '../types/params'
import { RepoState } from '../types/repoState'
import { getRepoLocationFromUrlString } from '../utils/utils'

const typeDef = `
    type File {
        name: String!
        content: String!
    }
    input FileInput {
      name: String!
      content: String!
    }
    type RepoState {
      currentBranch: String!
      files: [File]!
      branches: [String]!
      url: String!
      commitMessage: String!
    }
`

const resolvers = {
  Query: {
    cloneRepository: async (
      _root: unknown,
      args: { url: string },
      context: AppContext
    ): Promise<string> => {
      const repoLocation = getRepoLocationFromUrlString(args.url, context.currentUser.username)
      // TODO: Would be ideal that user's configs are set when repo
      // is first cloned instead of doing it in commit operation
      // (because automerges also require username and email)
      // requires user specific repos & clone only possible
      // when context.currentuser exists
      if (!existsSync(repoLocation)) {
        await cloneRepository(args.url, context.currentUser.username)
      } else {
        try {
          await pullNewestChanges(repoLocation)
        } catch (error) {
          // In case of merge conflict
          if (error.message === 'Merge conflict') {
            throw new ApolloError('Merge conflict detected')
          } else {
            throw new ApolloError(error.message)
          }
        }
      }
      // Pulling now if the repo is cloned from before

      return 'Cloned'
    },

    getRepoState: async (
      _root: unknown,
      args: { url: string },
      context: AppContext
    ): Promise<RepoState> => {
      const repoLocation = getRepoLocationFromUrlString(args.url, context.currentUser.username)
      const currentBranch = await getCurrentBranchName(repoLocation)
      const commitMessage = await getCurrentCommitMessage(repoLocation)

      const filePaths = await readRecursive(repoLocation, ['.git'])
      const files = filePaths.map((file) => ({
        name: relative('repositories/', file),
        content: readFileSync(file, 'utf-8'),
      }))

      const branches = await getLocalBranches(repoLocation)

      return { currentBranch, files, branches, url: args.url, commitMessage }
    },
  },
  Mutation: {
    saveChanges: async (
      _root: unknown,
      saveArgs: SaveArgs,
      context: AppContext
    ): Promise<string> => {
      if (!context.currentUser) {
        throw new ForbiddenError('You have to login')
      }

      try {
        await saveChanges(saveArgs, context)
      } catch (error) {
        if (error.message === 'Merge conflict') {
          throw new ApolloError('Merge conflict detected')
        } else {
          throw new ApolloError(error.message)
        }
      }

      return 'Saved'
    },
    switchBranch: async (
      _root: unknown,
      branchSwitchArgs: BranchSwitchArgs,
      context: AppContext
    ): Promise<string> => {
      const repoLocation = getRepoLocationFromUrlString(branchSwitchArgs.url, context.currentUser.username)
      return await switchCurrentBranch(repoLocation, branchSwitchArgs.branch)
    },
    pullRepository: async (
      _root: unknown,
      args: { url: string },
      context: AppContext
    ): Promise<string> => {
      const repoLocation = getRepoLocationFromUrlString(args.url, context.currentUser.username)
      try {
        await pullNewestChanges(repoLocation)
      } catch (error) {
        // In case of merge conflict
        if (error.message === 'Merge conflict') {
          throw new ApolloError('Merge conflict detected')
        } else {
          throw new ApolloError(error.message)
        }
      }
      return 'Pulled'
    },
  },
}

export default {
  resolvers,
  typeDef,
}
