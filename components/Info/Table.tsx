import THead from "./THead";
import TRow from "./TRow";

export function LeaderBoardTable(props: { title: string }) {
  return (
    <div className="my-5">
      <h4 className=" font-semibold mb-3">{props.title}</h4>

      <div className="relative overflow-x-auto sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <THead data={["Product name", "Color", "Category", "Price"]} />

          <tbody>
            <TRow
              head="Apple MacBook Pro 17"
              others={["Silver", "Laptop", "$2999"]}
            />
            <TRow
              head="Apple MacBook Pro 17"
              others={["Silver", "Laptop", "$2999"]}
            />
            <TRow
              head="Apple MacBook Pro 17"
              others={["Silver", "Laptop", "$2999"]}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}
