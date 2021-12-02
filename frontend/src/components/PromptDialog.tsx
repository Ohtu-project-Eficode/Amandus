import React from "react"
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
} from "@material-ui/core"


interface Props {
  open: boolean
  handleClose: () => void,
  handleSubmit: () => void,
  dialogTitle: string
}

const PromptDialog = ({
  open,
  handleClose,
  handleSubmit,
  dialogTitle
}: Props) => {

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">
        {dialogTitle}
      </DialogTitle>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSubmit()}
        >
          Confirm
        </Button>
      </DialogActions>|
    </Dialog>
  )
}

export default PromptDialog