const fetch = require("node-fetch");
const { Dog, Temperament } = require("../db");
const { apiKey } = process.env;

module.exports = {
  //////////////////////////////////
  ///// OBTENER INFO DE LA API /////
  //////////////////////////////////

  getApiInfo: async function () {
    let array = await fetch(
      `https://api.thedogapi.com/v1/breeds?${apiKey}`
    ).then((response) => response.json());

    array.map((el) => {
      el.createdByDB = false;
      if (el.hasOwnProperty("temperament")) {
        let string = el.temperament;
        let temperaments = string.replace(/ /g, "").split(",");

        let tmp_obj = temperaments.map((el) => {
          return { name: el };
        });

        el.temperament = tmp_obj;
      } else {
        el.temperament = [];
      }
    });
    return array;
  },
  //////////////////////////////////
  ///// OBTENER INFO DE LA DB /////
  //////////////////////////////////
  getDbInfo: async function () {
    let db = await Dog.findAll({
      include: {
        model: Temperament,
        attributes: ["name"],
        through: {
          name: "",
        },
      },
    });
    return db;
  },
  //////////////////////////////////
  /////      CREAR PERRO       /////
  //////////////////////////////////
  createDog: async function (
    name,
    height,
    weight,
    life_span,
    image,
    temperament
  ) {
    const temperamento = await Temperament.findAll({
      where: {
        name: temperament,
      },
    });

    let newDog = await Dog.create({
      name,
      height: {
        metric: `${height.min} - ${height.max}`,
      },
      weight: {
        metric: `${weight.min} - ${weight.max}`,
      },
      life_span: `${life_span.min} - ${life_span.max} years`,
      image,
      createdByDB: true,
    });

    return await newDog.addTemperament(temperamento);
  },
  //////////////////////////////////
  ///// BUSCAR TEMPERAMENTO    /////
  //////////////////////////////////
  searchTemperament: async function (temperament) {
    await Temperament.findAll({
      where: {
        name: temperament,
      },
    });
  },
  ///////////////////////////////////////////////////////////////
  ///// OBTENER TEMPERAMENTOS DE LA API Y CREARLOS EN LA DB /////
  //////////////////////////////////////////////////////////////
  getTemperaments: async function () {
    const getAllDogs = await fetch(
      `https://api.thedogapi.com/v1/breeds?${apiKey}`
    ).then((response) => response.json());

    let getAllTemperaments = getAllDogs
      .map((el) => el.temperament)
      .join(",")
      .replace(/ /g, "")
      .split(",")
      .sort();

    let set = [...new Set(getAllTemperaments)].filter((el, i) => i > 0);

    set.forEach(async (el) => {
      await Temperament.create({
        name: el,
      });
    });

    set = set.map((el) => (el = { name: el }));

    return set;
  },
};
