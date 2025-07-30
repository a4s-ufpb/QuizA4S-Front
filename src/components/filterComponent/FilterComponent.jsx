import { useState, useEffect } from "react";
import { Form, InputGroup, Dropdown, Button, Row, Col, Collapse } from "react-bootstrap";
import { BsCalendar } from "react-icons/bs";
import { ResponseService } from "../../service/ResponseService";
import "./FilterComponent.css";

const FilterComponent = ({ onData }) => {
  const [currentDate, setCurrentDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [username, setUsername] = useState("");
  const [themeName, setThemeName] = useState("");
  const [usernamesList, setUsernameList] = useState([]);
  const [filteredUsernames, setFilteredUsernames] = useState([]);
  const [themesList, setThemesList] = useState([]);
  const [filteredThemes, setFilteredThemes] = useState([]);
  const [showUsernameDropDown, setUsernameDropDown] = useState(false);
  const [showThemeNameDropDown, setThemeNameDropDown] = useState(false);
  const [showFilterPerDate, setFilterPerDate] = useState(false);

  const responseService = new ResponseService();

  const handleFilter = () => {
    onData({
      currentDate,
      finalDate,
      username,
      themeName,
    });
  };

  const clearInputs = () => {
    setCurrentDate("");
    setFinalDate("");
    setUsername("");
    setThemeName("");
    onData({ currentDate: "", finalDate: "", username: "", themeName: "" });
  };

  const fetchUsernames = async () => {
    const user = localStorage.getItem("user");
    const { uuid: creatorId } = JSON.parse(user);

    const response = await responseService.findUsernamesByCreator(creatorId);
    if (response.success) {
      setUsernameList(response.data || []);
      setFilteredUsernames(response.data || []);
    } else {
      console.error(response.message);
    }
  };

  const fetchThemeNames = async () => {
    const user = localStorage.getItem("user");
    const { uuid: creatorId } = JSON.parse(user);

    const response = await responseService.findThemeNamesByCreator(creatorId);
    if (response.success) {
      setThemesList(response.data || []);
      setFilteredThemes(response.data || []);
    } else {
      console.error(response.message);
    }
  };

  useEffect(() => {
    setFilteredUsernames(
      usernamesList.filter((data) =>
        data.username.toLowerCase().includes(username.toLowerCase())
      )
    );
  }, [username, usernamesList]);

  useEffect(() => {
    setFilteredThemes(
      themesList.filter((data) =>
        data.themeName.toLowerCase().includes(themeName.toLowerCase())
      )
    );
  }, [themeName, themesList]);

  return (
    <div className="filter-container">
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="username">
            <Form.Label>Usuário:</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Digite o nome do usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => {
                  setUsernameDropDown(true);
                  fetchUsernames();
                }}
                onBlur={() => setTimeout(() => setUsernameDropDown(false), 100)}
              />
            </InputGroup>
            <Dropdown show={showUsernameDropDown}>
              <Dropdown.Menu>
                {filteredUsernames.map((data, index) => (
                  <Dropdown.Item
                    key={index}
                    onMouseDown={() => setUsername(data.username)}
                  >
                    {data.username}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="themeName">
            <Form.Label>Tema:</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Digite o nome do tema"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                onFocus={() => {
                  setThemeNameDropDown(true);
                  fetchThemeNames();
                }}
                onBlur={() => setTimeout(() => setThemeNameDropDown(false), 100)}
              />
            </InputGroup>
            <Dropdown show={showThemeNameDropDown}>
              <Dropdown.Menu>
                {filteredThemes.map((data, index) => (
                  <Dropdown.Item
                    key={index}
                    onMouseDown={() => setThemeName(data.themeName)}
                  >
                    {data.themeName}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Form.Group>
            <Button
              variant="link"
              onClick={() => setFilterPerDate(!showFilterPerDate)}
              className="d-flex align-items-center gap-2"
            >
              <BsCalendar /> Filtrar por período
            </Button>
            <Collapse in={showFilterPerDate}>
              <Row className="g-3 mt-2">
                <Col md={6}>
                  <Form.Group controlId="currentDate">
                    <Form.Label>Data Inicial</Form.Label>
                    <Form.Control
                      type="date"
                      value={currentDate}
                      onChange={(e) => setCurrentDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="finalDate">
                    <Form.Label>Data Final</Form.Label>
                    <Form.Control
                      type="date"
                      value={finalDate}
                      onChange={(e) => setFinalDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Collapse>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col className="d-flex gap-2">
          <Button variant="primary" onClick={handleFilter}>
            Filtrar
          </Button>
          <Button variant="danger" onClick={clearInputs}>
            Limpar
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default FilterComponent;