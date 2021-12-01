import { gql } from '@apollo/client'

export const REPO_STATE = gql`
  query getRepoState($repoUrl: String!) {
    repoState: getRepoState(url: $repoUrl) {
      currentBranch
      files {
        name
        content
        status
      }
      branches
      url
      commitMessage
      service
      gitStatus {
        modified
        conflicted
      }
    }
  }
`

export const IS_GH_CONNECTED = gql`
  query {
    isGithubConnected
  }
`

export const IS_BB_CONNECTED = gql`
  query {
    isBitbucketConnected
  }
`

export const IS_GL_CONNECTED = gql`
  query {
    isGitLabConnected
  }
`

export const CLONE_REPO = gql`
  query cloneRepo($cloneUrl: String!) {
    cloneRepository(url: $cloneUrl)
  }
`

export const GITHUB_LOGIN_URL = gql`
  query {
    githubLoginUrl
  }
`

export const BITBUCKET_LOGIN_URL = gql`
  query {
    bitbucketLoginUrl
  }
`

export const GITLAB_LOGIN_URL = gql`
  query {
    gitLabLoginUrl
  }
`

export const ME = gql`
  query {
    me {
      username
      user_role
      email
      services {
        serviceName
        username
        email
        reposurl
      }
    }
  }
`

export const ALL_USERS = gql`
  query getAllUsers {
    getAllUsers {
      id
      username
      user_role
      email
    }
  }
`

export const GET_REPO_LIST = gql`
  query getRepoListFromService {
    getRepoListFromService {
      id
      name
      full_name
      clone_url
      html_url
      service
    }
  }
`

export const GET_SETTINGS = gql`
  query {
    getSettings {
      misc {
        name, 
        value, 
        unit,
        min,
        max
      }
      plugins {
        name,
        active
      }
    }
  }
`
