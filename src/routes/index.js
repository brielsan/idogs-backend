const { Router } = require("express");
const { Temperament } = require("../db");
const router = Router();

const {
  getApiInfo,
  getDbInfo,
  createDog,
  getTemperaments,
} = require("../functions/model.js");

router.get("/dogs", async (req, res) => {
  let getApi = await getApiInfo();
  let getDb = await getDbInfo();
  let allInfo = getApi.concat(getDb);

  ///-------------FIX BUGS API------------------///

  allInfo.forEach((el) => {
    if (el.name == "Olde English Bulldogge") {
      el.weight.metric = "22 - 30";
    }
    if (!el.weight.metric.includes("-")) {
      el.weight.metric = `0 - ${el.weight.metric}`;
    }
  });

  ///---------------------------------------------///

  allInfo.sort((a, b) => {
    // sort api & db
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }
    return 0;
  });

  if (req.query.name && req.query.name.length > 1) {
    let find = allInfo.find(
      (el) => el.name.toLowerCase() == req.query.name.toLowerCase()
    );
    if (find) return res.status(200).json([find]);
    else return res.status(404).json({ error: "There is no such race" });
  }
  return res.status(200).json(allInfo);
});

router.get("/dogs/:idRaza", async (req, res) => {
  const { idRaza } = req.params;

  let getApi = await getApiInfo();
  let getDb = await getDbInfo();
  let allInfo = getApi.concat(getDb);

  let filtrado = allInfo.find((el) => el.id == idRaza);

  return res.status(200).json(filtrado);
});

router.post("/dog", async (req, res) => {
  let { name, height, weight, life_span, temperament, image } = req.body;

  await createDog(name, height, weight, life_span, image, temperament);

  return res.status(200).json({ msg: "Dog created successfully" });
});

router.get("/temperament", (req, res) => {
  Temperament.findAll().then(async (r) => {
    if (r.length == 0) {
      console.log("The information comes from the api");
      getTemperaments().then((r) => res.status(200).json(r));
    } else {
      console.log("The information comes from the db");
      return res.status(200).json(r);
    }
  });
});

module.exports = router;
