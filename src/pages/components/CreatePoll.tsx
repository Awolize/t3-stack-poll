import React, { useState } from "react";

const inputStyle =
  "mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-800 rounded-md text-md text-slate-200 shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500";

const CreatePoll = (): JSX.Element => {
  const router = useRouter();
  const key = router.asPath.slice(1);
  const [choices, setChoices] = useState(2);
  const ctx = trpc.useContext();
  const renderChoices = () => {
    const jsx: JSX.Element[] = [];

    const input = (id: string) => {
      return <input key={id} className={inputStyle} placeholder="Type an answer" type="text" name="choice" id={id} />;
    };

    for (let i = 1; i <= choices; i++) {
      jsx.push(input(`${i}`));
    }

    return jsx;
  };

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

  return (
    <>
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
    </>
  );
};

export default CreatePoll;

import { Menu } from "@headlessui/react";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";
