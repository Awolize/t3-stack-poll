import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Link from "next/link";
import Poll from "./components/Poll";

const PollHome: NextPage = () => {
  const router = useRouter();
  const key = router.asPath.substring(1);

  const pollsByGroup = trpc.authPoll.getPollsByGroupKey.useQuery({
    key: key,
  });
  return (
    <>
      <Head>
        <title>Poll Feed</title>
        <meta name="description" content="Tech stack generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen flex-col text-slate-500 sm:flex-row">
        <div className="basis-1/6 p-2 ">
          <p className="text-purple-300 opacity-50">Room key: {key}</p>
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
  const { data, isLoading, isError } = trpc.authPoll.getPollsByGroupKey.useQuery({
    key: key,
  });

  const mutateCreatePoll = trpc.authPoll.createPoll.useMutation({
    onSuccess: (input) => {
      console.log(input);

      ctx.authPoll.getPollsByGroupKey.invalidate();
      setChoices(2);
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

  const inputStyle =
    "mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-800 rounded-md text-md text-slate-200 shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500";

  const [choices, setChoices] = useState(2);
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
    <div className="flex flex-col gap-6 text-white sm:px-[20%]">
      <Link href="/" className="text-center text-3xl font-bold text-purple-300">
        Feed
      </Link>
      <div>
        {/* -+ Buttons */}
        <div className="flex flex-row justify-end gap-1">
          <button
            type="button"
            onClick={() => setChoices((prev) => (prev > 1 ? --prev : prev))}
            className="w-10 rounded bg-slate-800 bg-gradient-to-r from-blue-800 to-purple-800 p-2  hover:from-blue-700 hover:to-purple-700"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setChoices((prev) => (prev < 20 ? ++prev : prev))}
            className="w-10 rounded bg-slate-800 bg-gradient-to-r from-purple-800 to-red-800 p-2 hover:from-purple-700 hover:to-red-700"
          >
            +
          </button>
        </div>
        {/* Create Poll Form */}
        <form onSubmit={handleCreatePoll} className="flex flex-col gap-2 ">
          <input className={inputStyle + " mb-2"} placeholder="Type your question" type="text" name="title" />
          {renderChoices()}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="rounded bg-slate-800 bg-gradient-to-r from-blue-700 to-purple-700 p-2 hover:from-blue-600 hover:to-purple-600"
            >
              Create poll
            </button>
          </div>{" "}
          <div className="my-6 w-full border-t border-dashed border-slate-800"></div>
        </form>
      </div>

      {/*           
      const disableChoices = poll.choices.some((choice) =>
            choice.pollVotes.some((user) => user.id === sessionData?.user?.id),
          ); */}

      <div className="flex flex-col gap-12 ">
        {data?.polls.map((poll) => (
          <Poll key={poll.id} pollId={poll.id} />
        ))}
      </div>
    </div>
  );
};

const Settings: React.FC = (): JSX.Element => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-row justify-end gap-4 ">
      <button
        onClick={sessionData ? () => signOut() : () => signIn()}
        className="flex h-16 w-16 items-center justify-center border border-gray-800 text-center "
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
      <button className="flex h-16 w-16 items-center justify-center border border-gray-800 text-center ">
        Profile
      </button>
    </div>
  );
};
