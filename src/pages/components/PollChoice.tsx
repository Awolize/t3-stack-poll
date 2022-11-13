import { useSession } from "next-auth/react";
import React from "react";
import { trpc } from "../../utils/trpc";

type Prop = {
  pollChoiceId: string;
  total: number;
  pollId: string;
};

const PollChoice = ({ total, pollChoiceId, pollId }: Prop): JSX.Element => {
  const { data: sessionData } = useSession();
  const ctx = trpc.useContext();

  const { data: choice } = trpc.authPoll.getPollChoice.useQuery({
    id: pollChoiceId,
  });

  let pressed = false;
  if (sessionData)
    pressed =
      trpc.authPoll.getPollChoiceStatus.useQuery({
        id: pollChoiceId,
      }).data ?? false;

  const voters = choice?.voters ?? [];
  const procentageOfVotes = (voters.length / (total ? total : 1)) * 100;

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

  const procentageWidth = procentageOfVotes > 0 ? procentageOfVotes : 100;
  const fillTW =
    "h-full text-md rounded-r-lg p-2  font-medium leading-none " + (pressed ? "bg-blue-800" : "bg-gray-800");
  const outerTW = "h-full w-full rounded-md";

  return choice ? (
    <div onClick={() => handleVoteClick(!pressed)} className={outerTW}>
      <div className="relative flex flex-row">
        <div
          className={procentageOfVotes > 0 ? fillTW : "h-full p-2 font-medium leading-none text-blue-100"}
          style={{ width: `${procentageWidth}%` }}
        >
          <ul className="flex flex-row gap-4">
            <li className="w-14">{procentageOfVotes}%</li>
            <li>{choice.title}</li>
          </ul>
        </div>
        <div className="absolute right-4 pt-1">{voters.length}</div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default PollChoice;
