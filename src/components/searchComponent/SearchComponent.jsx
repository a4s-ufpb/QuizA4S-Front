import { useState } from "react";
import { Container, Form, InputGroup } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";
import { ApiFetch } from "../../util/ApiFetch";
import Loading from "../loading/Loading";

const SearchComponent = ({
  title,
  url,
  placeholder,
  onSearch,
  setData,
  setTotalPages,
  setCurrentPage,
}) => {
  const apiFetch = new ApiFetch();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchDataName(value) {
    const inputName = value;

    if (onSearch) {
      onSearch(inputName);
    }

    setName(inputName);

    setLoading(true);
    const response = await apiFetch.getPages(
      `${url}${inputName}`,
      "Nenhum tema encontrado!"
    );

    if (!response.success) {
      setLoading(false);
      setData([]);
      setTotalPages(0);
      setCurrentPage(0);
      return;
    }

    setLoading(false);
    setTotalPages(response.totalPages);
    setData(response.data);
  }

  return (
    <Container className="mb-4">
      <h2 className="text-center mb-3 text-white">{title}</h2>
      <InputGroup className="shadow-sm">
        <InputGroup.Text>
          <Search />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={name}
          onChange={(e) => searchDataName(e.target.value)}
          className="border-start-0"
        />
      </InputGroup>
      {loading && <Loading />}
    </Container>
  );
};

export default SearchComponent;