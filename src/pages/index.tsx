import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import { Settings } from "./[id]";

const Home: NextPage = () => {
  //   const { data, isLoading, isError } = trpc.authPoll.getAllPollGroups.useQuery({
  //     user: "from tRPC",
  //   });

  return (
    <>
      <Head>
        <title>Create your poll</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <Settings />
      </header>
      <main className="flex min-h-screen min-w-full flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold leading-normal text-gray-300">
          Create <span className="text-purple-300">Your</span> Poll
        </h1>
        <div className="mt-3 grid justify-center gap-10  pt-3 md:grid-cols-2">
          <JoinRoomButton />
          <HostRoomButton />
        </div>

        {/* <div className="flex w-full items-center justify-center pt-6 text-2xl text-blue-500">
          {data ? <p>{data.greeting}</p> : <p>Loading..</p>}
        </div> */}
        <GroupsShowcase />
      </main>
    </>
  );
};

export default Home;

const GroupsShowcase: React.FC = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();

  const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  const { mutate } = trpc.authPoll.joinPollGroup.useMutation({
    onSuccess: (input) => {
      router.push({ pathname: input.key });
    },
  });

  const handleGroupNameButton = async (key: string) => {
    mutate({ key: key });
  };

  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-2 ">
      {/* {sessionData && <p className="text-2xl text-blue-500">Logged in as {sessionData?.user?.name}</p>} */}
      {secretMessage && (
        <>
          <h2 className="text-2xl font-extrabold leading-normal text-gray-300">
            <span className="text-purple-300">Your</span> Groups: {/* Your Groups */}
          </h2>
          <ul className="flex flex-col gap-1">
            {secretMessage.map((elem) => (
              <button
                key={elem.key}
                onClick={() => handleGroupNameButton(elem.key)}
                className="h-full rounded-md text-center text-lg underline decoration-purple-300  shadow-lg hover:text-gray-300"
              >
                {elem.key}
              </button>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

const JoinRoomButton: React.FC = () => {
  const router = useRouter();
  const { mutate } = trpc.authPoll.joinPollGroup.useMutation({
    onSuccess: (input) => {
      console.log(input);

      //   ctx.poll.getAllPollGroups.invalidate();

      //   if (input.users. == sessionData?.user?.id) {
      // todo will always be true becuase it updates the pollGroup
      router.push({ pathname: input.key });
      //   }
    },
  });

  const handleOnSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      key: { value: string };
    };

    mutate({ key: target.key.value });
  };

  return (
    <div>
      <form
        onSubmit={handleOnSubmit}
        className="m-auto flex h-[12rem] w-[24rem] flex-col items-center justify-center gap-3 rounded border border-gray-800 py-6  "
      >
        <div className=" h-1/3 ">
          <p className="text-center text-2xl text-gray-300">Join Room</p>
        </div>

        <label className="h-1/3 w-full px-6">
          <span className="sr-only">Enter room key</span>
          <input
            className="block w-full rounded-md border-slate-300 bg-gray-800 p-3 px-6 text-center text-sm placeholder:italic  placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Enter a room key..."
            type="text"
            name="key"
          />
        </label>

        <button type="submit" className="hover:bg-gray h-1/3 w-24 rounded bg-gray-800 py-2 px-4 text-purple-300">
          Join
        </button>
      </form>
    </div>
  );
};
const HostRoomButton: React.FC = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const ctx = trpc.useContext();
  const { mutate } = trpc.authPoll.createPollGroup.useMutation({
    onSuccess: (input) => {
      console.log(input);

      ctx.authPoll.getAllPollGroups.invalidate();

      if (input.creatorId == sessionData?.user?.id) {
        // todo will always be true becuase it updates the pollGroup
        router.push({ pathname: input.key });
      }
    },
  });

  const handleOnSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      key: { value: string };
    };

    mutate({ key: target.key.value });
  };

  return (
    <div>
      <form
        onSubmit={handleOnSubmit}
        className="m-auto flex h-[12rem] w-[24rem] flex-col items-center justify-center gap-3 rounded border border-gray-800 py-6  "
      >
        <div className=" h-1/3 ">
          <p className="text-center text-2xl text-gray-300">Create Room</p>
        </div>

        <div className="h-1/3 w-full px-6">
          <span className="sr-only">Enter room key</span>
          <input
            className="block w-full rounded-md border-slate-300 bg-gray-800 p-3 px-6 text-center text-sm placeholder:italic  placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Enter your room key..."
            type="text"
            name="key"
          />
          <div className="float-right flex flex-row gap-2">
            <input type="checkbox" name="private" />
            <label>Private</label>
          </div>
        </div>

        <button type="submit" className="hover:bg-gray w-24 rounded bg-gray-800 py-2 px-4 text-purple-300">
          Create
        </button>
      </form>
    </div>
  );
};
