import { resourcesData } from "../consts";

export const Resources = () => {
  return (
    <>
      <div className="container">
        <h1>Resources</h1>
        <p>Storage for resources that I found useful or leave for future.</p>
        {resourcesData.map((resource) => (
          <div key={resource.id}>
            <h2>{resource.title}</h2>
              <p>{resource.description}</p>
                <ul>
                  {resource.items.map((item, index) => (
                    <li key={index}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                      {item.description && (
                        <p>{item.description}</p>
                      )}
                      {item.authors && item.authors.length > 0 && (
                        <p>Authors: {item.authors.join(', ')}</p>
                      )}
                    </li>
                  ))}
                </ul>
            </div>
        ))}
      </div>
    </>
  );
}