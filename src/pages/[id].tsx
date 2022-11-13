import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import React, { Fragment, useRef, useState } from "react";
import Link from "next/link";
import Poll from "./components/Poll";
import CreatePoll from "./components/CreatePoll";

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
        <div className="basis-1/6  ">
          <Settings />
        </div>
      </div>
    </>
  );
};

export default PollHome;

const Feed: React.FC = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const key = router.asPath.substring(1);
  const { data, isLoading, isError } = trpc.authPoll.getPollsByGroupKey.useQuery({
    key: key,
  });

  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-6 text-white sm:px-[20%]">
      <Link href="/" className="text-center text-3xl font-bold text-purple-300">
        Feed
      </Link>
      <div>
        <button className="underline" onClick={() => setShow((prev) => !prev)}>
          {show ? "Hide create new poll" : "Create a new poll"}
        </button>
        {show && <CreatePoll />}
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

export const Settings: React.FC = (): JSX.Element => {
  const { data: sessionData } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-row justify-end gap-4 p-2">
      {sessionData && (
        <button
          onClick={() => setOpen(true)}
          className="flex h-16 w-16 items-center justify-center border border-gray-800  text-center text-slate-500 "
        >
          Members
        </button>
      )}
      <button
        onClick={sessionData ? () => signOut() : () => signIn()}
        className="h-17 w-17 flex items-center justify-center rounded-md  border border-black bg-violet-800   p-2 text-center  text-sm text-white shadow-lg hover:bg-violet-900 "
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
      <button className="flex h-16 w-16 items-center justify-center border border-gray-800  text-center text-slate-500 ">
        Profile
      </button>
      {MemberModal(open, setOpen)}
    </div>
  );
};

import { Dialog, Transition } from "@headlessui/react";
import { UsersIcon } from "@heroicons/react/24/solid";

export function MemberModal(open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>) {
  const cancelButtonRef = useRef(null);
  const router = useRouter();
  const key = router.asPath.substring(1);

  const { data } = trpc.authPoll.getPollGroupMembers.useQuery({
    key: key,
  });

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg border-2 border-gray-800 bg-bg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-700 sm:mx-0 sm:h-10 sm:w-10">
                      <UsersIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="mt-5 w-full text-center sm:mt-0 sm:ml-4  sm:text-left ">
                      <Dialog.Title as="h3" className="text-lg  font-medium leading-6 ">
                        Members
                      </Dialog.Title>
                      <div className="mt-2  ">
                        {data?.users && (
                          <ul className="h-1/2 ">
                            {data.users.map((elem) => (
                              <li
                                key={elem.id}
                                className="flex w-full items-center gap-2 rounded-md border border-slate-800 p-1"
                              >
                                {elem.image && (
                                  <img className="rounded-full " src={elem.image} width={40} height={40} />
                                )}
                                <p className="">{elem.name}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className=" px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-700 bg-bg px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
