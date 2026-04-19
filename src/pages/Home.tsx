import { personalData } from "../consts";

export const Home = () => {
  return (
    <div className="container">
      <h1>{personalData[0].title}</h1>
      <p>{personalData[0].body}</p>
    </div>
  );
}
