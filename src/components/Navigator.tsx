
export const Navigator = ({title} : {title: string}) => {
    return (
      <>
        <a href={`#${title}`}>{title}</a>
      </>
    );
}