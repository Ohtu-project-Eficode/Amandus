import { makeExecutableSchema } from 'graphql-tools'
import repository from './repository'
import user from './user'
import settings from './settings'

const Query = `
    type Query {
        githubLoginUrl: String!
        bitbucketLoginUrl: String!
        gitLabLoginUrl: String!
        me: User
        isGithubConnected: Boolean!
        isGitLabConnected: Boolean!
        isBitbucketConnected: Boolean!
        getRepoState(url: String): RepoState!
        cloneRepository(url: String!): String
        currentToken: String
        getRepoListFromService: [Repository]
        getSettings: Settings!
        getAllUsers: [User]
    },
`

const Mutation = `
    type Tokens {
        accessToken: String
        refreshToken: String
    }
    type ServiceAuthResponse {
        serviceUser: ServiceUser
        tokens: Tokens
    }
    type LocalUser {
        user_id: Int
        username: String
        email: String
    }
    input AddServiceArgs {
        serviceName: String!
        username: String!
        email: String
        reposurl: String!
    }
    type GithubAccount {
        username: String
        email: String
    }
    type Mutation {
        logout: String
        register(
            username: String!
            user_role: String
            email: String!
            password: String!
        ): Tokens
        login(
            username: String!
            password: String!
        ): Tokens
        saveChanges(
            files: [FileInput]! 
            branch: String!
            commitMessage: String
        ): String
        saveMergeEdit(
            files: [FileInput]! 
            commitMessage: String
        ): String
        connectGitService(
            service: AddServiceArgs!
        ): String
        switchBranch(
            url: String!
            branch: String!
        ): String
        authorizeWithService(
            code: String!
            service: String!
        ): ServiceAuthResponse
        pullRepository(
            url: String!
        ): String
        deleteUser(
            username: String!
        ): String
        deleteServiceTokens(
            username: String!
        ): String
        updateUser(
            username: String!,
            newUsername: String,
            newEmail: String,
            newPassword: String,
            newUserRole: String
        ): String
        localSave(
            file: FileInput!
        ): String
        commitLocalChanges(
            url: String!
            commitMessage: String
            fileName: String!
        ): String
        resetLocalChanges(
            url: String!
        ): String
        resetCurrentFile(
            url: String!
            fileName: String!
        ): String
        saveSettings(
            settings: Sinput!
        ): String
    }
`

const rootSchema = makeExecutableSchema({
  typeDefs: [Query, Mutation, user.typeDef, repository.typeDef, settings.typeDef],
  resolvers: [user.resolvers, repository.resolvers, settings.resolvers],
})

export default rootSchema
