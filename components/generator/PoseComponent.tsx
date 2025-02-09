/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  Stack,
  Avatar,
  TextField,
} from "@mui/material";
import { PoseObject, SinglePose } from "@/types";

export const poses: Record<string, SinglePose> = {
  doggyAssSpreadLegsSpreadAufrecht: {
    id: "doggyAssSpreadLegsSpreadAufrecht",
    title: "Doggy Ass Spread Beine Breit Aufrecht",
    description:
      "Mit dem Oberkörper aufgerichtet in Doggy-Position den Arsch spreizen.",
    img: "https://i.ibb.co/F3d6KPW/xyyy.jpg",
    additionalNote: "",
  },
  doggyAssSpreadLegsSpread: {
    id: "doggyAssSpreadLegsSpread",
    title: "Doggy Ass Spread Beine Breit",
    description: "Den Kopf nach unten, Beine breit und den Arsch spreizen.",
    img: "https://photos.xgroovy.com/contents/albums/sources/335000/335365/332410.jpg",
    additionalNote: "",
  },
  doggyPussySpreadLegSpread: {
    id: "doggyPussySpreadLegSpread",
    title: "Doggy Pussy Spread Beine Breit",
    description:
      "Doggy-Position mit Kopf nach unten, breiten Beinen und gespreizter Pussy",
    img: "https://photos.xgroovy.com/contents/albums/main/420x999/32000/32822/32816.jpg",
    additionalNote: "",
  },
  doggyAssPussySpreadLegsTight: {
    id: "doggyAssPussySpreadLegsTight",
    title: "Doggy Ass Spread Beine Eng",
    description:
      "Doggy-Position mit Kopf nach unten, Beinen eng und Arsch spreizen",
    img: "https://ftopx.com/large/202103/605a6b2d14ea6.jpg",
    additionalNote: "",
  },
  doggyPussySpreadLegsTight: {
    id: "doggyPussySpreadLegsTight",
    title: "Doggy Pussy Spread Beine Eng",
    description:
      "Doggy-Position mit Kopf nach unten, Beinen end und Pussy spreizen",
    img: "https://thumb-nss.xhcdn.com/a/Ifv7VunguKlSwWhVnqZsxA/005/367/333/1280x720.1.jpg",
    additionalNote: "",
  },
  doggyHeadDown: {
    id: "doggyHeadDown",
    title: "Normal doggy Kopf auf Boden",
    description: "",
    img: "https://cdni.wankoz.com/contents/videos_screenshots/198000/198715/preview_s.mp4.jpg",
    additionalNote: "",
  },
  doggyNormal: {
    id: "doggyNormal",
    title: "Normal doggy",
    description:
      "Normale Doggy-Position mit breiten Beinen und auf allen vieren",
    img: "https://cdn.eronite.com/wp-content/uploads/sex-im-doggystyle-katja-krasavice-eronite_re.jpg?strip=all&lossy=1&sharp=1&ssl=1",
    additionalNote: "",
  },
  missionaryPussySpread: {
    id: "missionaryPussySpread",
    title: "Missionary Pussy Spread",
    description:
      "Missionarsstellung auf dem Rücken mit Beinen nach oben und Pussy spreizen",
    img: "https://photos.xgroovy.com/contents/albums/sources/313000/313887/310644.jpg",
    additionalNote: "",
  },
  missionaryAssSpread: {
    id: "missionaryAssSpread",
    title: "Missionary Ass Spread",
    description:
      "Missionarsstellung auf dem Rücken mit Beinen nach oben und Arsch spreizen",
    img: "https://s73.erome.com/2569/pI1UCw0Q/thumbs/LvWrKmn9.jpeg?v=1715434357",
    additionalNote: "",
  },
  missionaryLegsUp: {
    id: "missionaryLegsUp",
    title: "Missionary Legs up",
    description:
      "Missionarsstellung auf dem Rücken und Beine nach oben und mit den Armen umklammern",
    img: "https://photos.xgroovy.com/contents/albums/sources/488000/488556/497187.jpg",
    additionalNote: "",
  },
  missionaryBothHoleSpread: {
    id: "missionaryBothHoleSpread",
    title: "Missionary both hole spread",
    description:
      "Missionarsstellung auf dem Rücken und unter den Beinen durchgreifen. In beide Löcher richtig die Finger reinstecken und auseinanderziehen, sodass diese geöffnet sind.",
    img: "https://photos.xgroovy.com/contents/albums/sources/526000/526781/545885.jpg",
    additionalNote: "",
  },
  missionaryLegsUpPussySpread: {
    id: "missionaryLegsUpPussySpread",
    title: "Missionary legs up pussy spread",
    description:
      "Missionarsstellung mit Beinen zu einer Kerze und die Pussy stark auseinanderziehen",
    img: "https://photos.xgroovy.com/contents/albums/sources/204000/204753/200592.jpg",
    additionalNote: "",
  },
  custom: {
    id: "custom",
    title: "",
    description: "",
    img: "",
    additionalNote: "",
  },
};

type Props = {
  currentValue: PoseObject;
  setValue: React.Dispatch<React.SetStateAction<PoseObject>>;
};

const PoseComponent = (props: Props) => {
  const theme = useTheme();
  const [customPose, setCustomPose] = useState<SinglePose>({
    id: "custom",
    title: "",
    description: "",
    img: "",
    additionalNote: "",
  });

  const changeSinglePose = (id: string) => {
    props.setValue((prevState: PoseObject) => ({
      ...prevState,
      chosenPose: poses[id] as SinglePose,
    }));
  };

  return (
    <Box sx={{ p: 2 }}>
      {props.currentValue.chosenPose.img && (
        <Paper
          elevation={3}
          sx={{
            maxWidth: 320,
            mx: "auto",
            mb: 4,
            borderRadius: 3,
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <img
            src={props.currentValue.chosenPose.img}
            style={{
              width: "100%",
              height: 280,
              objectFit: "cover",
            }}
          />
        </Paper>
      )}

      <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
        Position auswählen
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Object.values(poses).map((pose) => (
          <Grid item xs={12} sm={6} md={4} key={pose.id}>
            <Paper
              elevation={0}
              onClick={() => changeSinglePose(pose.id)}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: "pointer",
                border: `1px solid ${
                  props.currentValue.chosenPose.id === pose.id
                    ? theme.palette.primary.main
                    : theme.palette.divider
                }`,
                bgcolor:
                  props.currentValue.chosenPose.id === pose.id
                    ? theme.palette.mode === "dark"
                      ? theme.palette.primary.dark
                      : theme.palette.primary.light
                    : "background.default",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: theme.shadows[2],
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={pose.img}
                  variant="rounded"
                  sx={{ width: 60, height: 60 }}
                />
                <Box>
                  <Typography fontWeight={500}>{pose.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pose.description}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {props.currentValue.chosenPose.id !== "custom" && (
        <TextField
          fullWidth
          label="Notiz zur Position"
          variant="filled"
          multiline
          rows={3}
          sx={{ mb: 4 }}
          InputProps={{
            sx: {
              borderRadius: 2,
              backgroundColor: theme.palette.background.default,
            },
          }}
          value={props.currentValue.additionalNote}
          onChange={(e) => {
            props.setValue((prevState) => ({
              ...prevState,
              additionalNote: e.target.value,
            }));
          }}
        />
      )}

      {props.currentValue.chosenPose.id === "custom" && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.default",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            fontWeight={600}
            color="primary"
          >
            Custom Position
          </Typography>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Titel"
              variant="filled"
              value={customPose.title}
              onChange={(e) => {
                const newPose = { ...customPose, title: e.target.value };
                setCustomPose(newPose);
                props.setValue({ ...props.currentValue, chosenPose: newPose });
              }}
            />

            <TextField
              fullWidth
              label="Beschreibung"
              variant="filled"
              multiline
              rows={3}
              value={customPose.description}
              onChange={(e) => {
                const newPose = { ...customPose, description: e.target.value };
                setCustomPose(newPose);
                props.setValue({ ...props.currentValue, chosenPose: newPose });
              }}
            />

            <TextField
              fullWidth
              label="Bild-URL"
              variant="filled"
              value={customPose.img}
              onPaste={(e) => {
                const pasteText = e.clipboardData.getData("text");
                const newPose = { ...customPose, img: pasteText };
                setCustomPose(newPose);
                props.setValue({ ...props.currentValue, chosenPose: newPose });
              }}
              onChange={(e) => {
                const newPose = { ...customPose, img: e.target.value };
                setCustomPose(newPose);
                props.setValue({ ...props.currentValue, chosenPose: newPose });
              }}
              InputProps={{
                endAdornment: customPose.img && (
                  <Avatar
                    src={customPose.img}
                    variant="rounded"
                    sx={{ width: 60, height: 60 }}
                  />
                ),
              }}
            />

            <TextField
              fullWidth
              label="Zusätzliche Notiz"
              variant="filled"
              multiline
              rows={3}
              value={customPose.additionalNote}
              onChange={(e) => {
                const newPose = {
                  ...customPose,
                  additionalNote: e.target.value,
                };
                setCustomPose(newPose);
                props.setValue({ ...props.currentValue, chosenPose: newPose });
              }}
            />
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default PoseComponent;
