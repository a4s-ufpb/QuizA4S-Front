import ImgNotFound from "../../assets/data-not-found.webp";

import "./NotFoundComponent.css";

interface NotFoundComponentProps {
  title: string;
}

const NotFoundComponent = ({ title }: NotFoundComponentProps) => {
  return (
    <div className="container-not-found">
      <h2 className="title-not-found">{title}</h2>
      <img
        src={ImgNotFound}
        alt="image-not-found"
        className="img-not-found"
        width={250}
        height={250}
      />
    </div>
  );
};

export default NotFoundComponent;
