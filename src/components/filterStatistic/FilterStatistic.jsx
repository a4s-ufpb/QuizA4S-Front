import { useState, useEffect } from "react";
import { Form, InputGroup, Dropdown, Button, Row, Col, Collapse } from "react-bootstrap";
import { BsCalendar } from "react-icons/bs";
import { StatisticService } from "../../service/StatisticService";
import "./FilterStatistic.css";

const FilterStatistic = ({ onFilter }) => {
  const [studentName, setStudentName] = useState("");
  const [themeName, setThemeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [studentNameList, setStudentNameList] = useState([]);
  const [themeNameList, setThemeNameList] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredThemes, setFilteredThemes] = useState([]);
  const [showStudentOptions, setShowStudentOptions] = useState(false);
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const [showFilterPerDate, setFilterPerDate] = useState(false);

  const statisticService = new StatisticService();

  const handleFilter = () => {
    onFilter({
      studentName,
      themeName,
      startDate,
      endDate,
    });
  };

  const clearInputs = () => {
    setStudentName("");
    setThemeName("");
    setStartDate("");
    setEndDate("");
    onFilter({ studentName: "", themeName: "", startDate: "", endDate: "" });
  };

  const fetchDistinctStudentNames = async () => {
    const user = localStorage.getItem("user");
    const { uuid: creatorId } = JSON.parse(user);

    const response = await statisticService.findDistinctStudentNameByCreatorId(creatorId);
    if (response.success) {
      setStudentNameList(response.data || []);
      setFilteredStudents(response.data || []);
    } else {
      console.error(response.message);
    }
  };

  const fetchDistinctThemeNames = async () => {
    const user = localStorage.getItem("user");
    const { uuid: creatorId } = JSON.parse(user);

    const response = await statisticService.findDistinctThemeNameByCreatorId(creatorId);
    if (response.success) {
      setThemeNameList(response.data || []);
      setFilteredThemes(response.data || []);
    } else {
      console.error(response.message);
    }
  };

  useEffect(() => {
    setFilteredStudents(
      studentNameList.filter((data) =>
        data.studentName.toLowerCase().includes(studentName.toLowerCase())
      )
    );
  }, [studentName, studentNameList]);

  useEffect(() => {
    setFilteredThemes(
      themeNameList.filter((data) =>
        data.themeName.toLowerCase().includes(themeName.toLowerCase())
      )
    );
  }, [themeName, themeNameList]);

  return (
    <div className="filter-container">
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="studentName">
            <Form.Label>Usuário:</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Nome do Usuário"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onFocus={() => {
                  setShowStudentOptions(true);
                  fetchDistinctStudentNames();
                }}
                onBlur={() => setTimeout(() => setShowStudentOptions(false), 100)}
              />
            </InputGroup>
            <Dropdown show={showStudentOptions}>
              <Dropdown.Menu>
                {filteredStudents.map((data, index) => (
                  <Dropdown.Item
                    key={index}
                    onMouseDown={() => setStudentName(data.studentName)}
                  >
                    {data.studentName}
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
                placeholder="Tema"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                onFocus={() => {
                  setShowThemeOptions(true);
                  fetchDistinctThemeNames();
                }}
                onBlur={() => setTimeout(() => setShowThemeOptions(false), 200)}
              />
            </InputGroup>
            <Dropdown show={showThemeOptions}>
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
                  <Form.Group controlId="startDate">
                    <Form.Label>Data Início</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="endDate">
                    <Form.Label>Data Fim</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
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

export default FilterStatistic;