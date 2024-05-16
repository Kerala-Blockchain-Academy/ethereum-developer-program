import { Router } from "express";
import { instance } from "../lib/instance.js";
const router = Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/issue", async (req, res) => {
  try {
    const trx = await instance.issue(req.body.id, req.body.name, req.body.course, req.body.grade, req.body.date);
    console.log(trx);
    res.json(trx);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

router.get("/fetch", async (req, res) => {
  try {
    const result = await instance.Certificates(req.query.id);
    console.log(result);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

export default router;
