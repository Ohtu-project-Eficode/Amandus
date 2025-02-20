import { gql } from '@apollo/client'

export const AUTHORIZE_WITH_SERVICE = gql`
  mutation authorizeWithService($code: String!, $service: String!) {
    authorizeWithService(code: $code, service: $service) {
      serviceUser {
        serviceName
        username
        email
        reposurl
      }
      tokens {
        accessToken
        refreshToken
      }
    }
  }
`

export const SAVE_CHANGES = gql`
  mutation saveChanges(
    $files: [FileInput]!
    $branch: String!
    $commitMessage: String
  ) {
    saveChanges(
      files: $files, 
      branch: $branch, 
      commitMessage: $commitMessage
    )
  }
`

export const SAVE_MERGE = gql`
  mutation saveMergeEdit(
    $files: [FileInput]!, 
    $commitMessage: String
  ) {
    saveMergeEdit(
      files: $files, 
      commitMessage: $commitMessage
    )
  }
`

export const REGISTER = gql`
  mutation register(
    $username: String!, $email: String!, $password: String!
  ) {
    register(username: $username, email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      accessToken
      refreshToken
    }
  }
`

export const ADD_SERVICE = gql`
  mutation connectGitService($service: AddServiceArgs!) {
    connectGitService(service: $service)
  }
`

export const SWITCH_BRANCH = gql`
  mutation switchBranch($url: String!, $branch: String!) {
    switchBranch(url: $url, branch: $branch)
  }
`

export const PULL_REPO = gql`
  mutation pullRepository($repoUrl: String!) {
    pullRepo: pullRepository(url: $repoUrl)
  }
`

export const DELETE_USER = gql`
  mutation deleteUser($username: String!) {
    deleteUser(username: $username)
  }
`

export const DELETE_SERVICE_TOKENS = gql`
  mutation deleteServiceTokens($username: String!) {
    deleteServiceTokens(username: $username)
  }
`

export const SAVE_LOCALLY = gql`
  mutation localSave($file: FileInput!) {
    localSave(file: $file)
  }
`

export const COMMIT_CHANGES = gql`
  mutation commitLocalChanges(
    $url: String!, 
    $commitMessage: String, 
    $fileName: String!
  ) {
    commitLocalChanges(
      url: $url, commitMessage: 
      $commitMessage, 
      fileName: $fileName
    )
  }
`

export const RESET_HARD = gql`
  mutation resetLocalChanges($url: String!) {
    resetLocalChanges(url: $url) 
  }
`

export const RESET_FILE = gql`
  mutation resetCurrentFile($url: String!, $fileName: String!) {
    resetCurrentFile(url: $url, fileName: $fileName) 
  }
`

export const SAVE_SETTINGS = gql`
  mutation saveSettings($settings: Sinput!) {
    saveSettings(settings: $settings)
  }
`

export const UPDATE_USER = gql`
  mutation updateUser(
    $username: String!,
    $newUsername: String,
    $newEmail: String,
    $newPassword: String,
    $newUserRole: String
  ) {
    updateUser(
      username: $username,
      newUsername: $newUsername,
      newEmail: $newEmail,
      newPassword: $newPassword,
      newUserRole: $newUserRole
    ) {
      accessToken
      refreshToken
    }
  }
`
