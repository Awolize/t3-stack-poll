import React from "react";
import CloseButton from "./CloseButton";
import { trpc } from "./trpc";
import PollChoice from "./PollChoice";

type Prop = {
  pollId: string;
};

const Poll = ({ pollId }: Prop): JSX.Element => {
  const ctx = trpc.useContext();

  const { data: total, isLoading: totalLoading } = trpc.authPoll.getPollTotalVoters.useQuery({
    id: pollId,
  });

  console.log("total:?", total);

  const { data: poll, isLoading } = trpc.authPoll.getPoll.useQuery({
    id: pollId,
  });

  console.log({ id: pollId });

  return !isLoading && !totalLoading && poll ? (
    <div key={poll.id} className="flex flex-col gap-4 rounded ">
      {/* Poll title text and delete button */}
      <div className="flex gap-3 rounded-t bg-slate-800 p-4">
        <div className="flex w-full">
          <p style={{ wordBreak: "break-word" }} className="text-md float-left my-auto break-words">
            {poll.title}
          </p>
        </div>
        <div className="float-right my-auto">{deleteBtn(poll.id)}</div>
      </div>

      <div className="flex w-full flex-col gap-3  bg-bg">
        {poll.choices.map((choice) => (
          <PollChoice key={choice.id} pollChoiceId={choice.id} total={total ?? 0} pollId={pollId} />
        ))}
      </div>
    </div>
  ) : (
    <></>
  );

  function deleteBtn(pollId: string) {
    return <CloseButton callback={() => mutateDeletePoll.mutate({ pollId: pollId })} />;
  }

  const mutateDeletePoll = trpc.authPoll.deletePoll.useMutation({
    onSuccess: (input) => {
      console.log(input);

      ctx.authPoll.getPollsByGroupKey.invalidate();
    },
  });
};

export default Poll;
