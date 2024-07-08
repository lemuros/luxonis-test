import { Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import { ClientInfo } from "common/ClientInfo";
import { useGameInfo } from "./useGameInfo";

export type ClientDialogProps = {
  open: boolean;
  onClose: () => void;
  client: ClientInfo;
};

export const ClientDialog = (props: ClientDialogProps) => {
  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="xs" fullWidth>
      {props.open && (
        <>
          <DialogTitle>Game Details</DialogTitle>
          <ClientDialogContent {...props.client} />
        </>
      )}
    </Dialog>
  );
};

const ClientDialogContent = (client: ClientInfo) => {
  const game = useGameInfo(client.id);

  return (
    <DialogContent>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Players
      </Typography>
      <Typography variant="body2">
        Challenger: {`#${game?.challenger.id} ${game?.challenger.username}`}
      </Typography>
      <Typography variant="body2">
        Opponent: {`#${game?.rival.id} ${game?.rival?.username}`}
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
        Game Subject
      </Typography>
      <Typography variant="body2">
        Word: {game?.word ?? "<not specified yet>"}
      </Typography>
      <Typography variant="body2">
        Hint: {game?.hint ?? "<not specified yet>"}
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
        Answers
      </Typography>
      {game?.answers.map((answer, index) => (
        <Typography key={`${answer}-${index}`} variant="body2">
          {answer.correct ? "Correct " : "Wrong "}Answer {index + 1}:{" "}
          {answer.answer}
        </Typography>
      ))}
      {game?.answers.length === 0 && (
        <Typography variant="body2">No answers yet</Typography>
      )}
      {game?.ended && (
        <Typography sx={{ mt: 3 }} variant="body2">
          Game ended
        </Typography>
      )}
    </DialogContent>
  );
};
