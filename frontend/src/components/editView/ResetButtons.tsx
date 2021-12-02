import { Button, createStyles, makeStyles } from '@material-ui/core'
import React from 'react'
import useSaveDialog from '../../hooks/useSaveDialog'
import useEditor from './MonacoEditor/useMonacoEditor'
import PromptDialog from '../PromptDialog'

const ResetButtons = ({
  cloneUrl,
  filename,
}: {
  cloneUrl: string
  filename: string
}) => {
  const { mutationSaveLoading, pullLoading, resetAll, resetFile } =
    useEditor(cloneUrl)

  const classes = stylesInUse()

  const handleResetFile = async () => {
    await resetFile({
      variables: {
        url: cloneUrl,
        fileName: filename,
      },
    })
  }

  const {
    dialogOpen,
    handleDialogClose,
    handleDialogOpen,
  } = useSaveDialog()
  
  const handleResetClick = () => {
    handleDialogOpen()
  }

  const handleReset = async (): Promise<void> => {
    await resetAll({
      variables: {
        url: cloneUrl,
      },
    })
    handleDialogClose()
  }

  return (
    <>
      <PromptDialog
        open={dialogOpen}
        handleClose={handleDialogClose}
        handleSubmit={handleReset}
        dialogTitle={'This will reset the repository to latest commit'}
      />
      <Button
        style={{ marginLeft: 150 }}
        className={classes.resetButton}
        variant="outlined"
        size="small"
        disabled={pullLoading || mutationSaveLoading}
        onClick={handleResetFile}
      >
        Reset File
      </Button>
      <Button
        style={{ marginLeft: 5 }}
        className={classes.resetButton}
        variant="outlined"
        size="small"
        disabled={pullLoading || mutationSaveLoading}
        onClick={handleResetClick}
      >
        Reset Repo
      </Button>
    </>
  )
}

const stylesInUse = makeStyles(() =>
  createStyles({
    resetButton: {
      backgroundColor: 'red',
    },
  })
)

export default ResetButtons
