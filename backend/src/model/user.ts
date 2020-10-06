import { UserType, GitHubUserType } from '../../types/user'

// temp user data
const users:UserType[] = [
    {
      id: '1',
      username: 'Maurice',
      emails: ['maurice@moss.com'],
      password: 'abcdefg',
      token: '',
      gitHubid: '123124124'
    },
    {
      id: '2',
      username: 'Roy',
      emails: ['roy@trenneman.com'],
      password: 'imroy',
      token: '',
      gitHubid: '124214124'
    }
];

const addUser = (user:UserType):UserType => {
    users.push(user)
    return user
}

const getUsers = ():UserType[] => {
    return users
}

const getUserByGithubId = (id:string):UserType|undefined => {
    return users.find(user => user.gitHubid === id)
}

const findOrCreateUserByGitHubUser = (gitHubUser: GitHubUserType):UserType => {
    const gitHubId = gitHubUser.id?.toString()

    let match = users.find(user => user.gitHubid === gitHubId)
    if (!match) {
        match = {
            username: gitHubUser.login || '',
            emails: [gitHubUser.email || ''],
            gitHubid: gitHubId,
            gitHubLogin: gitHubUser.login,
            gitHubEmail: gitHubUser.email,
            gitHubReposUrl: gitHubUser.repos_url,
            gitHubToken: gitHubUser.access_token,
        }

        users.push(match) 
    }

    return match
}  

export default {
    getUsers,
    getUserByGithubId,
    addUser,
    findOrCreateUserByGitHubUser
}