import { resourcesData } from "../consts";

export const Resources = () => {
  return (
    <>
      <div className="container">
        <h1>Resources</h1>
        <p>Storage for resources that I found useful or leave for future.</p>
      </div>
      <div className="container">
        {resourcesData.map((resource) => (
          <div key={resource.id}>
            <h2>{resource.title}</h2>
              <p>{resource.description}</p>
                <ul>
                  {resource.items.map((item, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                      {item.description && (
                        <span>{item.description}</span>
                      )}
                      {item.authors && item.authors.length > 0 && (
                        <span>Authors: {item.authors.join(', ')}</span>
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