import { useLazyQuery, useQuery } from '@apollo/client'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { CLONE_REPO, ME, REPO_STATE } from '../graphql/queries'
import { MeQueryResult, RepoStateQueryResult } from '../types'
import AuthenticateDialog from './AuthenticateDialog'
import MonacoDiffEditor from './MonacoDiffEditor/'
import useMergeConflictDetector from './MonacoDiffEditor/useMergeConflictDetector'
import MonacoEditor from './MonacoEditor'
import Sidebar from './Sidebar'

interface LocationState {
  cloneUrl: string
}

interface Props {
  cloneUrl: string | undefined
}

const EditView = ({ cloneUrl }: Props) => {
  const location = useLocation<LocationState>()
  const classes = useStyles()

  const { data: user } = useQuery<MeQueryResult>(ME)

  const [repoStateQuery, { data: repoStateData }]
    = useLazyQuery<RepoStateQueryResult>(
      REPO_STATE,
      {
        fetchPolicy: 'network-only',
        variables: { repoUrl: cloneUrl }
      }
    )

  const cloneRepoQuery = useQuery(
    CLONE_REPO,
    {
      variables: { cloneUrl },
      skip: !cloneUrl,
      onCompleted: () => repoStateQuery()
    }
  )


  const files = repoStateData ? repoStateData.repoState.files : []
  const filename = location.search.slice(3)
  const file = files.find((e) => e.name === filename)
  const fileContent = file?.content || ''
  const commitMessage = repoStateData
    ? repoStateData.repoState.commitMessage
    : ''

  const mergeConflictExists = useMergeConflictDetector(fileContent)

  if (cloneRepoQuery.error) {
    console.log(`Clone error: ${cloneRepoQuery.error}`)
    return <div>Error cloning repo...</div>
  }

  if (cloneRepoQuery.loading) return <div>Cloning repo...</div>

  // TODO: "can't perform react state update on unmounted component "
  // if (repoStateLoading) return <div>Fetching repo state...</div>
  // if (repoStateError) return <div>Error fetching repo state...</div>

  const renderEditor = () => {
    if (!cloneUrl && !location.state?.cloneUrl)
      return (!user || !user.me)
        ? null
        : <div>Please select repository first</div>

    if (!file) {
      return null
    }

    if (mergeConflictExists) {
      return (
        <div className={classes.editor}>
          <MonacoDiffEditor
            original={fileContent}
            filename={filename}
            commitMessage={commitMessage}
            cloneUrl={cloneUrl}
          />
        </div>
      )
    }

    return (
      <div className={classes.editor}>
        <MonacoEditor
          content={fileContent}
          filename={filename}
          commitMessage={commitMessage}
          onMergeError={repoStateQuery}
          cloneUrl={cloneUrl}
        />
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <div className={classes.sidebar}>
        <Sidebar files={files} currentUrl={cloneUrl} />
        <AuthenticateDialog open={!user || !user.me} />
      </div>
      <div className={classes.editor}>{renderEditor()}</div>

    </div>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
    },
    sidebar: {
      flexShrink: 0,
      width: '20%',
    },
    editor: {
      flexGrow: 1,
    },
  })
)

export default EditView
