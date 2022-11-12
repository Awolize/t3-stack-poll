import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { trpc } from "../utils/trpc";
import { PollChoice } from "@prisma/client";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Link from "next/link";
import CloseButton from "../utils/CloseButton";

const PollHome: NextPage = () => {
  const router = useRouter();
  const key = router.asPath.substring(1);

  const pollsByGroup = trpc.poll.getPollsByGroupKey.useQuery({
    key: key,
  });
  return (
    <>
      <Head>
        <title>Poll Feed</title>
        <meta name="description" content="Tech stack generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="divide flex h-screen flex-row divide-x divide-slate-500 text-slate-500">
        <div className="basis-1/6 p-2 ">
          <p className="text-purple-300 opacity-50">Room key: {pollsByGroup.data?.key}</p>
        </div>
        <div className="basis-4/6 p-2 ">
          <Feed key={key} />
        </div>
        <div className="basis-1/6 p-2 ">
          <Settings />
        </div>
      </div>
    </>
  );
};

export default PollHome;

const Feed: React.FC = () => {
  const { data: sessionData } = useSession();
  const ctx = trpc.useContext();
  const router = useRouter();
  const key = router.asPath.substring(1);
  const { data, isLoading, isError } = trpc.poll.getPollsByGroupKey.useQuery({
    key: key,
  });

  const mutateCastVote = trpc.poll.pollVote.useMutation({
    onSuccess: (input) => {
      console.log("pollVote:", input);
      ctx.poll.getPollsByGroupKey.invalidate();
    },
  });

  const mutateCreatePoll = trpc.poll.createPoll.useMutation({
    onSuccess: (input) => {
      console.log(input);

      ctx.poll.getPollsByGroupKey.invalidate();
      setChoices(1);
    },
  });

  const mutateDeletePoll = trpc.poll.deletePoll.useMutation({
    onSuccess: (input) => {
      console.log(input);

      ctx.poll.getPollsByGroupKey.invalidate();
      setChoices(1);
    },
  });

  const handleCreatePoll = async (e: any) => {
    e.preventDefault();

    // it changes type depending on if its more than 1 item, but then its not a list... oh no.... its an objectList
    const choicesList: string[] = [];
    e.target.choice instanceof RadioNodeList
      ? e.target.choice.forEach((elem: { value: string }) => choicesList.push(elem.value))
      : choicesList.push(e.target.choice.value);

    const target = e.target as typeof e.target & {
      title: { value: string };
    };

    mutateCreatePoll.mutate({
      title: target.title.value,
      choices: choicesList,
      pollGroupId: key,
    });
  };

  const handleCheckBoxClick = (choice: PollChoice, value: boolean) => {
    console.log("handleCheckBoxClick");
    mutateCastVote.mutate({ choiceId: choice.id, checked: value });
  };

  const inputStyle =
    "mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-800 rounded-md text-md text-slate-200 shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500";

  const [choices, setChoices] = useState(1);
  const renderChoices = () => {
    const jsx: any[] = [];

    const input = (id: any) => {
      return <input className={inputStyle} placeholder="Type an answer" type="text" name="choice" id={id} />;
    };

    for (let i = 1; i <= choices; i++) {
      jsx.push(input(i));
    }

    return jsx;
  };

  return (
    <div className="flex flex-col gap-6 px-[20%]">
      <Link href="/" className="text-center text-3xl font-bold text-purple-300">
        Feed
      </Link>
      <div>
        <div className="flex flex-row justify-end gap-1">
          <button
            type="button"
            onClick={() => setChoices((prev) => (prev > 1 ? --prev : prev))}
            className="w-10 rounded bg-slate-800 bg-gradient-to-r from-blue-800 to-purple-800 p-2 text-white hover:from-blue-700 hover:to-purple-700"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setChoices((prev) => (prev < 20 ? ++prev : prev))}
            className="w-10 rounded bg-slate-800 bg-gradient-to-r from-purple-800 to-red-800 p-2 text-white hover:from-purple-700 hover:to-red-700"
          >
            +
          </button>
        </div>
        <form onSubmit={handleCreatePoll} className="flex flex-col gap-2 ">
          <input className={inputStyle + " mb-2"} placeholder="Type your question" type="text" name="title" />

          {renderChoices()}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="rounded bg-slate-800 bg-gradient-to-r from-blue-700 to-purple-700 p-2 text-white hover:from-blue-600 hover:to-purple-600"
            >
              Create poll
            </button>
          </div>
        </form>
      </div>
      {data &&
        data.polls.map((poll) => {
          const disableChoices = poll.choices.some((choice) =>
            choice.pollVotes.some((user) => user.id === sessionData?.user?.id),
          );

          return (
            <div className="container text-slate-200" key={poll.id}>
              <div key={poll.id} className="divide-y-4 divide-bg rounded bg-slate-800">
                <div className="flex gap-3 p-4 ">
                  <div className="flex w-full">
                    <p style={{ wordBreak: "break-word" }} className="float-left my-auto break-words text-lg">
                      {poll.title}
                    </p>
                  </div>

                  <div className="float-right my-auto">{deleteBtn(poll.id)}</div>
                </div>
                <div className="w-full divide-y-2 divide-bg ">
                  {poll.choices.map((choice, index) => (
                    <div key={choice.id} className="flex flex-row bg-slate-800 p-2 px-10 py-3">
                      <div className="flex flex-row gap-6 ">
                        <div>{index + 1}.</div> <div>{choice.title}</div>
                        <div>
                          <label>
                            <input
                              onChange={(e: React.SyntheticEvent) => {
                                const target = e.target as typeof e.target & {
                                  checked: boolean;
                                };

                                handleCheckBoxClick(choice, target.checked);
                              }}
                              type="checkbox"
                              name="checkbox"
                              checked={choice.pollVotes.some((user) => user.id === sessionData?.user?.id)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );

  function deleteBtn(pollId: string) {
    return <CloseButton callback={() => mutateDeletePoll.mutate({ pollId: pollId })} />;
  }
};

const Settings: React.FC = (): JSX.Element => {
  return (
    <div className="flex flex-row justify-end gap-4 ">
      <button className="flex h-16 w-16 items-center justify-center border border-gray-800 text-center ">Logout</button>
      <button className="flex h-16 w-16 items-center justify-center border border-gray-800 text-center ">
        Profile
      </button>
    </div>
  );
};
