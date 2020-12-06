import React from 'react'
import GitHubIcon from '@material-ui/icons/GitHub'
import Button from '@material-ui/core/Button'
import { useQuery } from '@apollo/client'
import { GITHUB_LOGIN_URL } from '../../graphql/queries'
import { GithubLoginURLQueryResult } from '../../types'

const GitHubAuthBtn = () => {
  const { data, error } = useQuery<GithubLoginURLQueryResult>(GITHUB_LOGIN_URL)

  const btnClickHandler = (): void => {
    window.location.href = data!.githubLoginUrl
  }

  if (error || !data) {
    return <></>
  }

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        startIcon={<GitHubIcon />}
        onClick={btnClickHandler}
      >
        Connect GitHub
      </Button>
    </div>
  )
}

export default GitHubAuthBtn
