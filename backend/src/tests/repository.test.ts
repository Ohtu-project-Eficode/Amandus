/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { gql } from 'apollo-server'
import { createTestClient } from 'apollo-server-testing'
import {
  createTestClient as createIntegrationTestClient,
  TestQuery,
} from 'apollo-server-integration-testing'
import { appendFileSync, mkdirSync, rmdirSync } from 'fs'
import { join } from 'path'
import simpleGit from 'simple-git'
import { server } from '../index'
import User from '../model/user'
import { closePool } from '../db/connect'
import { createTokens } from '../utils/tokens'
import user from '../model/user'
import { UserType } from '../types/user'
import { Tokens } from '../types/tokens'
import config from '../utils/config'

const repositoriesDir: string = config.REPONAME

const SAVE_CHANGES = gql`
  mutation saveChanges(
    $files: [FileInput]!
    $branch: String!
    $commitMessage: String
  ) {
    saveChanges(files: $files, branch: $branch, commitMessage: $commitMessage)
  }
`

const SAVE_LOCALLY = gql`
  mutation localSave($file: FileInput!) {
    localSave(file: $file)
  }
`

describe('getRepoState query', () => {
  const repoPath = join(
    '.',
    `${repositoriesDir}`,
    'testuser',
    'github',
    'test'
  )
  let testUser: UserType
  let tokens: Tokens
  let query: TestQuery

  beforeEach(async () => {
    mkdirSync(repoPath, { recursive: true })
    await simpleGit(repoPath).init()
    await user.deleteAll()
    testUser = await User.registerUser({
      username: 'testuser',
      password: 'mypAssword?45',
      email: 'test@test.fi',
    })
    tokens = createTokens(testUser)
    const testClient = createIntegrationTestClient({
      apolloServer: server,
      extendMockRequest: {
        headers: {
          'x-access-token': tokens.accessToken,
          'x-refresh-token': tokens.refreshToken,
        },
      },
    })
    query = testClient.query
  })

  afterEach(() => {
    rmdirSync(repoPath, { recursive: true })
  })

  it('list of all branches is empty when no branches exist', async () => {
    const GET_REPO_BRANCHES = gql`
      query {
        getRepoState(url: "https://github.com/test") {
          branches
        }
      }
    `
    const queryResult = await query(GET_REPO_BRANCHES)
    expect(queryResult).toEqual({ data: { getRepoState: { branches: [] } } })
  })

  it('list of all branches contains correct branches', async () => {
    appendFileSync(
      `${repoPath}/file.txt`,
      'Commit and add file to create master branch'
    )

    const testRepo = simpleGit(repoPath)
    await testRepo
      .addConfig('user.name', 'Some One')
      .addConfig('user.email', 'some@one.com')
      .add('.')
      .commit('init commit')
      .branch(['secondBranch'])

    const GET_REPO_BRANCHES = gql`
      query {
        getRepoState(url: "https://github.com/test") {
          branches
        }
      }
    `
    const queryResult = await query(GET_REPO_BRANCHES)
    expect(queryResult).toEqual({
      data: { getRepoState: { branches: ['master', 'secondBranch'] } },
    })
  })

  it('list of current files is empty when no files exist', async () => {
    const GET_REPO_FILES = gql`
      query {
        getRepoState(url: "https://github.com/test") {
          files {
            name
            content
          }
        }
      }
    `
    const queryResult = await query(GET_REPO_FILES)
    expect(queryResult).toEqual({ data: { getRepoState: { files: [] } } })
  })

  it('list of all files contains correct files', async () => {
    appendFileSync(
      `${repoPath}/file.txt`,
      'Commit and add file to create master branch'
    )

    const testRepo = simpleGit(repoPath)
    await testRepo
      .addConfig('user.name', 'Some One')
      .addConfig('user.email', 'some@one.com')
      .add('.')
      .commit('init commit')
      .branch(['secondBranch'])

    const GET_REPO_FILES = gql`
      query {
        getRepoState(url: "https://github.com/test") {
          files {
            name
            content
          }
        }
      }
    `
    const queryResult = await query(GET_REPO_FILES)
    expect(queryResult).toEqual({
      data: {
        getRepoState: {
          files: [{
            content: 'Commit and add file to create master branch',
            name: 'testuser/github/test/file.txt',
          }],
        },
      },
    })
  })

  it('current branch name is empty when branch status is unknown', async () => {
    const GET_REPO_BRANCH = gql`
      query {
        getRepoState(url: "https://github.com/test") {
          currentBranch
        }
      }
    `
    const queryResult = await query(GET_REPO_BRANCH)
    expect(queryResult).toEqual({
      data: { getRepoState: { currentBranch: '' } },
    })
  })

  it('current branch name is correct', async () => {
    appendFileSync(
      `${repoPath}/file.txt`,
      'Commit and add file to create master branch'
    )

    const testRepo = simpleGit(repoPath)
    await testRepo
      .addConfig('user.name', 'Some One')
      .addConfig('user.email', 'some@one.com')
      .add('.')
      .commit('init commit')
      .branch(['secondBranch'])

    const GET_REPO_BRANCH = gql`
      query {
        getRepoState(url: "https://github.com/test") {
          currentBranch
        }
      }
    `
    const queryResult = await query(GET_REPO_BRANCH)
    expect(queryResult).toEqual({
      data: { getRepoState: { currentBranch: 'master' } },
    })
  })

  it('latest commit message is empty when status is unknown', async () => {
    const GET_COMMIT_MESSAGE = gql`
      query {
        getRepoState(url: "https://github.com/test") {
          commitMessage
        }
      }
    `
    const queryResult = await query(GET_COMMIT_MESSAGE)
    expect(queryResult).toEqual({
      data: { getRepoState: { commitMessage: '' } },
    })
  })

  it('latest commit message is correct', async () => {
    appendFileSync(
      `${repoPath}/file.txt`,
      'Commit and add file to create master branch'
    )

    const testRepo = simpleGit(repoPath)
    await testRepo
      .addConfig('user.name', 'Some One')
      .addConfig('user.email', 'some@one.com')
      .add('.')
      .commit('new commit')
    const GET_COMMIT_MESSAGE = gql`
      query {
        getRepoState(url: "https://github.com/test") {
          commitMessage
        }
      }
    `

    const queryResult = await query(GET_COMMIT_MESSAGE)
    expect(queryResult).toEqual({
      data: { getRepoState: { commitMessage: 'new commit' } },
    })
  })

  it('too long commit message is cutted correctly', async () => {
    appendFileSync(
      `${repoPath}/file.txt`,
      'Commit and add file to create master branch'
    )

    const testRepo = simpleGit(repoPath)
    await testRepo
      .addConfig('user.name', 'Some One')
      .addConfig('user.email', 'some@one.com')
      .add('.')
      .commit('a'.repeat(73))

    const GET_COMMIT_MESSAGE = gql`
      query {
        getRepoState(url: "https://github.com/test") {
          commitMessage
        }
      }
    `

    const queryResult = await query(GET_COMMIT_MESSAGE)
    expect(queryResult).toEqual({
      data: { getRepoState: { commitMessage: 'a'.repeat(72).concat('...') } },
    })
  })
})

describe('switchBranch mutation', () => {
  const repoPath = join(
    '.',
    `${repositoriesDir}`,
    'testuser',
    'github',
    'test'
  )
  let testUser: UserType
  let tokens: Tokens
  let mutate: TestQuery

  beforeEach(async () => {
    mkdirSync(repoPath, { recursive: true })
    await simpleGit(repoPath).init()

    appendFileSync(
      `${repoPath}/file.txt`,
      'Commit and add file to create master branch'
    )

    await user.deleteAll()
    testUser = await User.registerUser({
      username: 'testuser',
      password: 'mypAssword?45',
      email: 'test@test.fi',
    })
    tokens = createTokens(testUser)
    const testClient = createIntegrationTestClient({
      apolloServer: server,
      extendMockRequest: {
        headers: {
          'x-access-token': tokens.accessToken,
          'x-refresh-token': tokens.refreshToken,
        },
      },
    })
    mutate = testClient.mutate
  })

  afterEach(() => {
    rmdirSync(repoPath, { recursive: true })
  })

  it('switches current branch to given existing branch', async () => {
    const testRepo = simpleGit(repoPath)
    await testRepo
      .addConfig('user.name', 'Some One')
      .addConfig('user.email', 'some@one.com')
      .add('.')
      .commit('init commit')
      .branch(['secondBranch'])

    const SWITCH_BRANCH = gql`
      mutation {
        switchBranch(url: "https://github.com/test", branch: "secondBranch")
      }
    `
    await mutate(SWITCH_BRANCH)

    const branches = await testRepo.branchLocal()
    expect(branches.current).toEqual('secondBranch')
  })

  it('returns the name of the branch it switched to', async () => {
    const testRepo = simpleGit(repoPath)
    await testRepo
      .addConfig('user.name', 'Some One')
      .addConfig('user.email', 'some@one.com')
      .add('.')
      .commit('init commit')
      .branch(['secondBranch'])

    const SWITCH_BRANCH = gql`
      mutation {
        switchBranch(url: "https://github.com/test", branch: "secondBranch")
      }
    `

    expect(await mutate(SWITCH_BRANCH)).toEqual({
      data: { switchBranch: 'secondBranch' },
    })
  })

  it('creates a new branch when switching to branch that does not exist', async () => {
    const testRepo = simpleGit(repoPath)
    await testRepo
      .addConfig('user.name', 'Some One')
      .addConfig('user.email', 'some@one.com')
      .add('.')
      .commit('init commit')
      .branch(['secondBranch'])

    const SWITCH_BRANCH = gql`
      mutation {
        switchBranch(url: "https://github.com/test", branch: "thirdBranch")
      }
    `
    await mutate(SWITCH_BRANCH)

    const branches = await testRepo.branchLocal()
    expect(branches.current).toEqual('thirdBranch')
  })
})

describe('SaveChanges mutation', () => {
  const repoPath = join(
    '.',
    `${repositoriesDir}`,
    'testuser',
    'github',
    'fakegithubuser',
    'testRepo'
  )

  beforeEach(async () => {
    await User.deleteAll()
    mkdirSync(repoPath, { recursive: true })
    await simpleGit(repoPath).init()
  })

  afterEach(() => {
    rmdirSync(repoPath, { recursive: true })
  })

  it('Saving changes works for a local user', async () => {
    const userToSave = {
      username: 'testuser',
      password: 'testpassword',
      email: 'test@test.fi',
    }

    const user = await User.registerUser(userToSave)

    const tokens = createTokens(user)

    const { mutate, query } = createIntegrationTestClient({
      apolloServer: server,
      extendMockRequest: {
        headers: {
          'x-access-token': tokens.accessToken,
          'x-refresh-token': tokens.refreshToken,
        },
      },
    })

    const mutateResult = await mutate(SAVE_CHANGES, {
      variables: {
        files: [
          {
            name: `testuser/github/fakegithubuser/testRepo/file.txt`,
            content: 'test content',
          },
        ],
        branch: 'master',
        commitMessage: 'Add test file',
      },
    })

    expect(mutateResult).toEqual({
      data: {
        saveChanges: 'Saved',
      },
    })

    const gitData = await simpleGit(repoPath).show(['--name-only'])
    const authorIsCorrect = gitData.includes('Author: testuser <test@test.fi>')
    const filenameIsCorrect = gitData.includes('file.txt')
    const commitMessageIsCorrect = gitData.includes('Add test file')

    expect([
      authorIsCorrect,
      filenameIsCorrect,
      commitMessageIsCorrect,
    ]).toEqual([true, true, true])

    const GET_REPO_FILES = gql`
      query {
        getRepoState(url: "https://github.com/${repoPath.split('/').slice(-2).join('/')}") {
          files {
            name
            content
          }
          commitMessage
        }
      }
    `
    const queryResult = await query(GET_REPO_FILES)

    expect(queryResult).toEqual({
      data: {
        getRepoState: {
          files: [{
            content: 'test content',
            name: `${repoPath.split('/').slice(1,).join('/')}/file.txt`
          }],
          commitMessage: 'Add test file'
        }
      }
    })
  })

  it('Saving changes does not work when user is not defined', async () => {
    const { mutate } = createTestClient(server)

    const mutateResult = await mutate({
      mutation: SAVE_CHANGES,
      variables: {
        files: [
          {
            name: `testuser/github/fakegithubuser/testRepo/file.txt`,
            content: 'test content',
          },
        ],
        branch: 'master',
        commitMessage: 'Add test file',
      },
    })

    const errorFound = mutateResult.errors?.some(
      (error) => error.message === 'You have to login'
    )

    expect(errorFound).toBeTruthy()
  })
})

describe('Local save and Reset mutations', () => {
  const repoPath = join(
    '.',
    `${repositoriesDir}`,
    'testuser',
    'github',
    'fakegithubuser',
    'testRepo'
  )
  let testUser: UserType
  let tokens: Tokens
  let mutate: TestQuery
  let query: TestQuery

  const modifiedContent = 'modified content'

  const GET_REPO_FILES = gql`
      query {
        getRepoState(url: "https://github.com/${repoPath.split('/').slice(-2).join('/')}") {
          files {
            name
            content
          }
          commitMessage
        }
      }
    `

  beforeEach(async () => {
    mkdirSync(repoPath, { recursive: true })
    await simpleGit(repoPath).init()

    await user.deleteAll()
    testUser = await User.registerUser({
      username: 'testuser',
      password: 'mypAssword?45',
      email: 'test@test.fi',
    })

    tokens = createTokens(testUser)
    const testClient = createIntegrationTestClient({
      apolloServer: server,
      extendMockRequest: {
        headers: {
          'x-access-token': tokens.accessToken,
          'x-refresh-token': tokens.refreshToken,
        },
      },
    })

    mutate = testClient.mutate
    query = testClient.query

    appendFileSync(
      `${repoPath}/file1.txt`,
      'Expected test content1'
    )
    appendFileSync(
      `${repoPath}/file2.txt`,
      'Expected test content2'
    )

    await mutate(SAVE_CHANGES, {
      variables: {
        files: [
          {
            name: `${repoPath.split('/').slice(1,).join('/')}/file1.txt`,
            content: 'Expected test content1',
          },
          {
            name: `${repoPath.split('/').slice(1,).join('/')}/file2.txt`,
            content: 'Expected test content2',
          },
        ],
        branch: 'master',
        commitMessage: 'Expected commit',
      },
    })
  })

  afterEach(() => {
    rmdirSync(repoPath, { recursive: true })
  })

  it('local save works as expected', async () => {

    const mutateResult = await mutate(SAVE_LOCALLY, {
      variables: {
        file:
        {
          name: `${repoPath.split('/').slice(1,).join('/')}/file1.txt`,
          content: modifiedContent,
        }
      },
    })

    expect(mutateResult).toEqual({
      data: {
        localSave: 'Saved locally',
      },
    })

    const queryResult = await query(GET_REPO_FILES)
    expect(queryResult).toEqual({
      data: {
        getRepoState: {
          files:
            expect.arrayContaining(
              [{
                name: `${repoPath.split('/').slice(1,).join('/')}/file1.txt`,
                content: modifiedContent,
              },
              {
                name: `${repoPath.split('/').slice(1,).join('/')}/file2.txt`,
                content: 'Expected test content2'
              }]
            ),
          commitMessage: 'Expected commit'
        }
      }
    })
  })

  it('reseting file works as expected', async () => {

    await mutate(SAVE_LOCALLY, {
      variables: {
        file: {
          name: `${repoPath.split('/').slice(1,).join('/')}/file1.txt`,
          content: modifiedContent,
        }
      },
    })

    const RESET_FILE = gql`
      mutation resetCurrentFile($url: String!, $fileName: String!) {
        resetCurrentFile(url: $url, fileName: $fileName) 
      }
    `

    const mutateResult = await mutate(RESET_FILE, {
      variables: {
        url: `https://github.com/${repoPath.split('/').slice(-2).join('/')}`,
        fileName: `${repoPath.split('/').slice(1,).join('/')}/file1.txt`
      }
    })

    expect(mutateResult).toEqual({
      data: {
        resetCurrentFile: `reset file ${repoPath.split('/').slice(1,).join('/')}/file1.txt`,
      },
    })

    const queryResult = await query(GET_REPO_FILES)
    expect(queryResult).toEqual({
      data: {
        getRepoState: {
          files:
            expect.arrayContaining(
              [{
                name: `${repoPath.split('/').slice(1,).join('/')}/file1.txt`,
                content: 'Expected test content1'
              },
              {
                name: `${repoPath.split('/').slice(1,).join('/')}/file2.txt`,
                content: 'Expected test content2'
              }]
            ),
          commitMessage: 'Expected commit'
        }
      }
    })
  })

  it('reseting repository works as expected', async () => {

    await mutate(SAVE_LOCALLY, {
      variables: {
        file: {
          name: `${repoPath.split('/').slice(1,).join('/')}/file1.txt`,
          content: modifiedContent,
        }
      },
    })

    await mutate(SAVE_LOCALLY, {
      variables: {
        file: {
          name: `${repoPath.split('/').slice(1,).join('/')}/file2.txt`,
          content: modifiedContent,
        }
      },
    })

    const queryResult = await query(GET_REPO_FILES)
    expect(queryResult).toEqual({
      data: {
        getRepoState: {
          files:
            expect.arrayContaining(
              [{
                name: `${repoPath.split('/').slice(1,).join('/')}/file1.txt`,
                content: modifiedContent
              },
              {
                name: `${repoPath.split('/').slice(1,).join('/')}/file2.txt`,
                content: modifiedContent
              }]
            ),
          commitMessage: 'Expected commit'
        }
      }
    })

    const RESET_HARD = gql`
      mutation resetLocalChanges($url: String!) {
        resetLocalChanges(url: $url) 
      }
    `

    const mutateResult = await mutate(RESET_HARD, {
      variables: {
        url: `https://github.com/${repoPath.split('/').slice(-2).join('/')}`
      }
    })

    expect(mutateResult).toEqual({
      data: {
        resetLocalChanges: expect.stringMatching("HEAD is now at ")
      },
    })

    const finalQueryResult = await query(GET_REPO_FILES)
    expect(finalQueryResult).toEqual({
      data: {
        getRepoState: {
          files:
            expect.arrayContaining(
              [{
                name: `${repoPath.split('/').slice(1,).join('/')}/file1.txt`,
                content: 'Expected test content1'
              },
              {
                name: `${repoPath.split('/').slice(1,).join('/')}/file2.txt`,
                content: 'Expected test content2'
              }]
            ),
          commitMessage: 'Expected commit'
        }
      }
    })
  })
})

afterAll(async () => {
  await closePool()
})
