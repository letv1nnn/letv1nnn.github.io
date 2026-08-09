import { Fragment, type ReactNode } from "react";
import { personalData } from "../consts";

type Link = { label: string; url: string };

// Split body text and wrap any matched link labels in anchors.
const renderBody = (body: string, links?: Link[]): ReactNode => {
  if (!links || links.length === 0) return body;

  let nodes: ReactNode[] = [body];
  links.forEach(({ label, url }, li) => {
    nodes = nodes.flatMap((node, ni) => {
      if (typeof node !== "string") return [node];
      const parts = node.split(label);
      return parts.flatMap((part, pi) =>
        pi < parts.length - 1
          ? [
              part,
              <a
                key={`${li}-${ni}-${pi}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>,
            ]
          : [part]
      );
    });
  });

  return nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>);
};

export const Home = () => {
  const [first, ...rest] = personalData;

  return (
    <div className="container">
      {first && (
        <>
          <h1>{first.title}</h1>
          <p>{renderBody(first.body, first.links)}</p>
        </>
      )}

      {rest.map((data) => (
        <div key={data.id}>
          <h2>{data.title}</h2>
          <p>{renderBody(data.body, data.links)}</p>
        </div>
      ))}
    </div>
  );
}
