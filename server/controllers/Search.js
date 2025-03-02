const {
  Plant,
  Plant_size,
  Plant_space,
  Plant_specie,
} = require('../models/Index');

module.exports = {
  get: async (req, res) => {
    try {
      const { size, space, species } = req.query;
      // 검색 조건이 없다면 전체 식물 검색으로 인지, 이에 맞는 응답을 보낸다
      if (!size && !space && !species) {
        const allPlants = await Plant.findAll({
          attributes: ['id', 'image', 'name'],
        });

        if (allPlants) {
          return res.status(200).json({
            data: {
              plantsTotal: allPlants.length,
              plantsArray: allPlants,
            },
            message: '전체 식물 정보를 가져왔습니다',
          });
        } else {
          return res
            .status(404)
            .json({ message: '검색 결과 페이지를 찾을 수 없습니다' });
        }
      }

      // 식물 취향 찾기: 세 조건 모두 필수
      if (!size || !space || !species) {
        return res
          .status(400)
          .json({ message: '검색 조건을 다시 확인해주세요' });
      }

      const sizeResults = Plant_size.findAll({
        attributes: [],
        include: {
          model: Plant,
          attributes: ['id', 'name', 'image'],
          required: true,
        },
        where: { sizeId: size },
      });

      const spaceResults = Plant_space.findAll({
        attributes: [],
        include: {
          model: Plant,
          attributes: ['id', 'name', 'image'],
          required: true,
        },
        where: { spaceId: space },
      });

      const speciesResults = Plant_specie.findAll({
        attributes: [],
        include: {
          model: Plant,
          attributes: ['id', 'name', 'image'],
          required: true,
        },
        where: { speciesId: species },
      });

      Promise.all([sizeResults, spaceResults, speciesResults])
        .then(([size, space, species]) => {
          size = size.map(el => el.dataValues.Plant.dataValues);
          space = space.map(el => el.dataValues.Plant.dataValues);
          species = species.map(el => el.dataValues.Plant.dataValues);

          // 동일 id 기준 교집합
          // size && space
          let res1 = size.filter(el1 => {
            return space.map(el2 => el2.id).includes(el1.id);
          });

          //size && species
          let res2 = size.filter(el1 => {
            return species.map(el2 => el2.id).includes(el1.id);
          });

          res1 = res1.filter(el1 => {
            return res2.map(el2 => el2.id).includes(el1.id);
          });

          return res.status(200).json({
            data: {
              plantsTotal: res1.length,
              plantsArray: res1,
            },
            message: '검색한 게시물들을 가져왔습니다',
          });
        })
        .catch(console.log);
    } catch (e) {
      //서버 에러 처리
      console.error(e);
      return res
        .status(500)
        .json({ message: '서버가 검색 결과 조회에 실패했습니다' });
    }
  },
};
