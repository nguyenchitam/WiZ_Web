import React, { useEffect, useState } from "react";
import { Button, Container, Table, Spinner } from "reactstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
  Lightbulb,
  LightbulbFill,
  LightbulbOffFill,
  Recycle,
  TreeFill,
  Fire,
  SunFill,
  MoonFill,
  TrashFill,
} from "react-bootstrap-icons";

const BulbList = () => {
  const [bulbs, setBulbs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/crud/bulbs")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Load: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(`${data.error}`);
        }
        setBulbs(data.bulbs);
      })
      .catch((error) => {
        console.log(error);
        toast.error(`${error}`);
      });
    setLoading(false);
  }, []);

  const scan = async () => {
    setLoading(true);
    await fetch("/wiz/scan")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Scan: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(`${data.error}`);
        }
        setBulbs(data.bulbs);
      })
      .catch((error) => {
        console.log(error);
        toast.error(`${error}`);
      });
    setLoading(false);
  };

  const bulbAction = async (event, url) => {
    const currentTarget = event.currentTarget;
    currentTarget.disabled = true;
    await fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Action: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("action", data);
        if (data.error) {
          throw new Error(`${data.error}`);
        }
        const updatedMap = new Map(data.bulbs.map((bulb) => [bulb.ip, bulb]));
        const updatedBulbs = bulbs.map((bulb) => {
          if (updatedMap.has(bulb.ip)) {
            const updatedBulb = updatedMap.get(bulb.ip);
            if (updatedBulb.state < 0) {
              toast.error(`'${updatedBulb.name}' is down`);
            }
            return updatedBulb;
          }
          return bulb;
        });
        setBulbs(updatedBulbs);
      })
      .catch((error) => {
        console.log(error);
        toast.error(`${error}`);
      });
    currentTarget.disabled = false;
  };

  const bulbOn = async (event, ip) => {
    await bulbAction(event, `/wiz/on/${ip}`);
  };

  const bulbOff = async (event, ip) => {
    await bulbAction(event, `/wiz/off/${ip}`);
  };

  const bulbScene = async (event, ip, sceneId) => {
    await bulbAction(event, `/wiz/scene/${ip}/${sceneId}`);
  };

  const deleteBulb = (bulb) => {
    if (window.confirm(`Delete '${bulb.name}'?`)) {
      fetch(`/crud/bulbs/${bulb.ip}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Cannot delete Bulb ${bulb.name}: ${response.status} ${response.statusText}`
            );
          }
          let updatedBulbs = [...bulbs].filter((i) => i.ip !== bulb.ip);
          setBulbs(updatedBulbs);
        })
        .catch((error) => {
          console.log(error);
          toast.error(`${error}`);
        });
    }
  };

  const changeName = (bulb) => {
    let name = prompt(`Name of bulb ${bulb.ip}?`, `${bulb.name}`);
    if (name != null && name.trim().length > 0) {
      bulb.name = name.trim();
      fetch(`/crud/bulbs/${bulb.ip}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bulb),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Cannot update Bulb ${bulb.name}: ${response.status} ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((data) => {
          const updatedMap = new Map(data.bulbs.map((bulb) => [bulb.ip, bulb]));
          const updatedBulbs = bulbs.map((bulb) =>
            updatedMap.has(bulb.ip) ? updatedMap.get(bulb.ip) : bulb
          );
          setBulbs(updatedBulbs);
        })
        .catch((error) => {
          console.log(error);
          toast.error(`${error}`);
        });
    }
  };

  if (loading) {
    return (
      <Spinner className="m-2 float-end" color="primary">
        Loading...
      </Spinner>
    );
  }

  const bulbList = bulbs.map((bulb) => {
    let button;
    if (bulb.state < 0) {
      button = (
        <Button
          className="m-1"
          color="secondary"
          onClick={(event) => bulbOn(event, bulb.ip)}
        >
          <LightbulbOffFill />
        </Button>
      );
    } else if (bulb.state === 0) {
      button = (
        <Button
          className="m-1"
          color="danger"
          onClick={(event) => bulbOn(event, bulb.ip)}
        >
          <Lightbulb />
        </Button>
      );
    } else {
      button = (
        <>
          <Button
            className="m-1"
            color="success"
            onClick={(event) => bulbOff(event, bulb.ip)}
          >
            <LightbulbFill />
          </Button>
          <span>{bulb.scene}</span>
        </>
      );
    }
    return (
      <tr key={bulb.ip}>
        <td style={{ whiteSpace: "nowrap" }}>
          <b>
            <Link
              style={{ textDecoration: "none" }}
              onClick={() => changeName(bulb)}
            >
              {bulb.name}
            </Link>
          </b>
          {bulb.ip !== bulb.name && <div>{bulb.ip}</div>}
        </td>
        <td>{button}</td>
        <td>
          <Button
            className="m-1"
            color="primary"
            onClick={(event) => bulbScene(event, bulb.ip, 4)}
          >
            <Recycle />
          </Button>
          <Button
            className="m-1"
            color="success"
            onClick={(event) => bulbScene(event, bulb.ip, 27)}
          >
            <TreeFill />
          </Button>
          <Button
            className="m-1"
            color="warning"
            onClick={(event) => bulbScene(event, bulb.ip, 5)}
          >
            <Fire />
          </Button>
          <Button
            className="m-1"
            color="warning"
            onClick={(event) => bulbScene(event, bulb.ip, 11)}
          >
            <LightbulbFill />
          </Button>
          <Button
            className="m-1"
            color="light"
            onClick={(event) => bulbScene(event, bulb.ip, 12)}
          >
            <SunFill />
          </Button>
          <Button
            className="m-1"
            color="dark"
            onClick={(event) => bulbScene(event, bulb.ip, 14)}
          >
            <MoonFill />
          </Button>
          <Button
            className="m-1"
            color="danger"
            onClick={() => deleteBulb(bulb)}
          >
            <TrashFill />
          </Button>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <Container fluid>
        <div className="float-end">
          <Button className="my-2" color="success" onClick={() => scan()}>
            Scan
          </Button>
        </div>
        <h3 className="text-center m-2">WiZ React</h3>
        <Table className="mt-4">
          <thead>
            <tr className="table-dark">
              <th>Bulb</th>
              <th>
                <Button
                  className="m-1"
                  color="success"
                  onClick={(event) => bulbOn(event, "all")}
                >
                  <LightbulbFill />
                </Button>
                <Button
                  className="m-1"
                  color="danger"
                  onClick={(event) => bulbOff(event, "all")}
                >
                  <Lightbulb />
                </Button>
              </th>
              <th>
                <Button
                  className="m-1"
                  color="primary"
                  onClick={(event) => bulbScene(event, "all", 4)}
                >
                  <Recycle />
                </Button>
                <Button
                  className="m-1"
                  color="success"
                  onClick={(event) => bulbScene(event, "all", 27)}
                >
                  <TreeFill />
                </Button>
                <Button
                  className="m-1"
                  color="warning"
                  onClick={(event) => bulbScene(event, "all", 5)}
                >
                  <Fire />
                </Button>
                <Button
                  className="m-1"
                  color="warning"
                  onClick={(event) => bulbScene(event, "all", 11)}
                >
                  <LightbulbFill />
                </Button>
                <Button
                  className="m-1"
                  color="light"
                  onClick={(event) => bulbScene(event, "all", 12)}
                >
                  <SunFill />
                </Button>
                <Button
                  className="m-1"
                  color="dark"
                  onClick={(event) => bulbScene(event, "all", 14)}
                >
                  <MoonFill />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>{bulbList}</tbody>
        </Table>
      </Container>
    </div>
  );
};

export default BulbList;
