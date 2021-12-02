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
    <div id='prompt-dialog'>
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
            id="cancel-button"
            variant="outlined"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            id="submit-button"
            data-cy='ConfirmButton'
            variant="contained"
            color="primary"
            className="submit"
            onClick={() => handleSubmit()}
          >
            Confirm
          </Button>
        </DialogActions>|
      </Dialog>
    </div>

  )
}

export default PromptDialog