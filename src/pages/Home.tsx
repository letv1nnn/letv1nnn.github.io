import { personalData } from "../consts";

export const Home = () => {
  return (
    <>
      <div className="container">
        <h1>{personalData[0].title}</h1>
        <p>{personalData[0].body}</p>
        
        {personalData.slice(1).map((data) => (
          <div key={data.id}>
            <h2>{data.title}</h2>
            <p>{data.body}</p>
          </div>
        ))}

      </div>
    </>
  );
}
