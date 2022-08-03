import logo from "./logo.svg";
import "./App.css";
import { useFormik, useFormikContext } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { Popover, Typography } from "@mui/material";

const validate = (values) => {
  const errors = {};
  if (!values.paragraph_content) {
    errors.paragraph_content = "Required";
  } else if (values.paragraph_content.length > 500) {
    errors.paragraph_content = "Must be 500 characters or less";
  }
  return errors;
};

function App() {
  const [words, setWords] = useState({
    wordsArr: [],
    hyperWords: [],
    quickView: "",
  });
  const [anchorEl, setAnchorEl] = useState(null);

  const formik = useFormik({
    initialValues: {
      paragraph_content: "",
    },
    validate,
    onSubmit: (values, { setSubmitting }) => {
      setSubmitting(true);
      let paragraph = formik.values.paragraph_content;
      const trimmed_paragraph = paragraph.trim();
      const words = trimmed_paragraph.split(" ");
      setWords((prevState) => ({
        ...prevState,
        wordsArr: words,
      }));
      const trimmed = checkWordsLen(words);
      setWords((prevState) => ({
        ...prevState,
        hyperWords: trimmed,
      }));
      setWords((prevState) => ({
        ...prevState,
        wordsArr: "",
        quickView: "",
      }));

      formik.values.paragraph_content = "";
      setSubmitting(false);
    },
  });

  const checkWordsLen = (words) => {
    const meaningfulWords = [];
    Array.isArray(words) &&
      words.map((word) => {
        if (word.length >= 5) meaningfulWords.push(word);
      });
    return meaningfulWords;
  };

  const fetchMeaning = (event, word) => {
    setAnchorEl(event.currentTarget);
    setWords((prevState) => ({
      ...prevState,
      quickView: "",
    }));
    return new Promise(async (resolve, reject) => {
      try {
        const url = "https://api.dictionaryapi.dev/api/v2/entries/en";
        await axios.get(`${url}/${word}`).then((res) => {
          if (res.status === 200) {
            setWords((prevState) => ({
              ...prevState,
              quickView: res?.data[0]?.meanings[1]?.definitions[0]?.definition,
            }));
          }
          resolve();
        });
      } catch (e) {
        console.log(e);
      }
    });
  };

  const open = Boolean(anchorEl);

  const id = open ? "word-meaning" : undefined;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const quickWord =
    words.hyperWords &&
    words.hyperWords.map((word, index) => (
      <strong key={index}>
        <a
          id={id}
          style={{
            textDecoration: "underline",
            margin: "1em",
          }}
          onClick={(e) => fetchMeaning(e, word)}
        >
          {word}
        </a>
      </strong>
    ));

  return (
    <div className="App">
      <header className="App-header">
        <p style={{ border: "1px solid", padding: "1em" }}>Quick Dictionary</p>
        <form onSubmit={formik.handleSubmit}>
          {formik.touched.paragraph_content &&
          formik.errors.paragraph_content ? (
            <div
              style={{
                color: "red",
              }}
            >
              {formik.errors.paragraph_content}
            </div>
          ) : null}
          <label
            htmlFor="paragraph"
            style={{
              margin: "1em",
              display: "block",
            }}
          >
            Paragraph
          </label>
          <textarea
            id="paragraph_content"
            name="paragraph_content"
            rows="10"
            cols="50"
            onChange={formik.handleChange}
            value={formik.values.paragraph_content}
          ></textarea>
          <button
            type="submit"
            disabled={formik.isSubmitting}
            style={{
              margin: "1em",
              display: "block",
              border: "none",
              padding: "0.5em 1em",
            }}
          >
            Submit
          </button>
        </form>
        <section>{quickWord}</section>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Typography
            sx={{
              p: 2,
              color: "seagreen",
              background: "lightgreen",
            }}
          >
            {words.quickView ? (
              words.quickView
            ) : (
              <code
                style={{
                  color: "red",
                  textShadow:
                    "0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e60073, 0 0 40px #e60073, 0 0 50px #e60073, 0 0 60px #e60073, 0 0 70px #e60073",
                }}
              >
                Meaning Not Found 404
              </code>
            )}
          </Typography>
        </Popover>
      </header>
    </div>
  );
}

export default App;
