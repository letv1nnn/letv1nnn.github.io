import { personalData } from "../consts";

export const Home = () => {
  const [first, ...rest] = personalData;

  return (
    <div className="container">
      {first && (
        <>
          <h1>{first.title}</h1>
          <p>{first.body}</p>
        </>
      )}

      {rest.map((data) => (
        <div key={data.id}>
          <h2>{data.title}</h2>
          <p>{data.body}</p>
        </div>
      ))}
    </div>
  );
}
