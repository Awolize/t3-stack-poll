import React from "react";
import { trpc } from "./trpc";

type Prop = {
  pollChoiceId: string;
  total: number;
  pollId: string;
};

const PollChoice = ({ total, pollChoiceId, pollId }: Prop): JSX.Element => {
  const ctx = trpc.useContext();

  const { data: choice } = trpc.authPoll.getPollChoice.useQuery({
    id: pollChoiceId,
  });
  const { data: status } = trpc.authPoll.getPollChoiceStatus.useQuery({
    id: pollChoiceId,
  });

  const voters = choice?.voters ?? [];
  const pressed = status;
  const procentageOfVotes = (voters.length / total) * 100;

  const mutateCastVote = trpc.authPoll.pollVote.useMutation({
    onSuccess: () => {
      ctx.authPoll.getPollTotalVoters.invalidate({ id: pollId });
      ctx.authPoll.getPollChoice.invalidate({ id: pollChoiceId });
      ctx.authPoll.getPollChoiceStatus.invalidate({ id: pollChoiceId });
    },
  });

  const handleVoteClick = (vote: boolean) => {
    if (choice) {
      mutateCastVote.mutate({ choiceId: choice.id, checked: vote });
    }
  };

  const fillTW = "h-full text-md rounded-r-lg p-2  font-medium leading-none " + (pressed ? "bg-blue-800" : "");
  const outerTW = "h-full w-full rounded-md";

  return choice ? (
    <div onClick={() => handleVoteClick(!pressed)} className={outerTW}>
      {procentageOfVotes > 0 ? (
        <div className={fillTW} style={{ width: `${procentageOfVotes}%` }}>
          {choice.title}
        </div>
      ) : (
        <div className={"h-full w-full p-2 font-medium leading-none text-blue-100 "}>{choice.title}</div>
      )}
    </div>
  ) : (
    <div>Loading</div>
  );
};

export default PollChoice;
