import { useState } from "react";
import * as React from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";

import Chip from "@mui/material/Chip";

import { experimentalStyled as styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

function App() {
  const [loginState, setLoginState] = useState("Connect");

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              DAO: Certi App
            </Typography>
            <Button color="inherit">
              <b>{loginState}</b>
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      <h2>Active Proposals</h2>
      <div
        style={{
          border: "2px solid blue",
          padding: "10px",
          borderRadius: "25px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
          >
            <Grid item xs={2} sm={4} md={4}>
              <Card sx={{ minWidth: 275 }}>
                <CardContent>
                  <Typography component="div" paragraph>
                    <b>Proposal ID: </b>
                    40113249118907347497846265566344225737
                    199931284307161947685216366528597413334
                  </Typography>

                  <Typography variant="body2">
                    Proposal #5: Issue certificate CED10
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained">Vote</Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
              <Card sx={{ minWidth: 275 }}>
                <CardContent>
                  <Typography component="div" paragraph>
                    <b>Proposal ID: </b>
                    40113249118907347497846265566344225737
                    199931284307161947685216366528597413334
                  </Typography>

                  <Typography variant="body2">
                    Proposal #6: Issue certificate EDP234
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained">Vote</Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
              <Card sx={{ minWidth: 275 }}>
                <CardContent>
                  <Typography component="div" paragraph>
                    <b>Proposal ID: </b>
                    40113249118907347497846265566344225737
                    199931284307161947685216366528597413334
                  </Typography>

                  <Typography variant="body2">
                    Proposal #7: Issue certificate 111
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" color="secondary">
                    Queue
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
              <Card sx={{ minWidth: 275 }}>
                <CardContent>
                  <Typography component="div" paragraph>
                    <b>Proposal ID: </b>
                    40113249118907347497846265566344225737
                    199931284307161947685216366528597413334
                  </Typography>

                  <Typography variant="body2">
                    Proposal #8: Issue certificate 176
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" color="secondary">
                    Queue
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
              <Card sx={{ minWidth: 275 }}>
                <CardContent>
                  <Typography component="div" paragraph>
                    <b>Proposal ID: </b>
                    40113249118907347497846265566344225737
                    199931284307161947685216366528597413334
                  </Typography>

                  <Typography variant="body2">
                    Proposal #9: Issue certificate EDP101
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" color="error">
                    Execute
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={2} sm={4} md={4}>
              <Card sx={{ minWidth: 275 }}>
                <CardContent>
                  <Typography component="div" paragraph>
                    <b>Proposal ID: </b>
                    40113249118907347497846265566344225737
                    199931284307161947685216366528597413334
                  </Typography>

                  <Typography variant="body2">
                    Proposal #10: Issue certificate EDP300
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" color="error">
                    Execute
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </div>
      <Button variant="outlined" onClick={handleClickOpen}>
       New Proposal
      </Button>
      <h2>All Proposals</h2>
      <div
        style={{
          border: "2px solid blue",
          padding: "10px",
          borderRadius: "25px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ArrowDownwardIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "90%",
              }}
            >
              <Typography>
                <b>Proposal ID: </b>
                40113249118907347497846265566344225737199931284307161947685216366528597413334
              </Typography>
              <Chip label="Success" color="primary" />
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Proposal #1: Issue certificate 101</Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ArrowDownwardIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "90%",
              }}
            >
              <Typography>
                <b>Proposal ID: </b>
                40113249118907347497846265566344225737199931284307161947685216366528597413334
              </Typography>
              <Chip label="Success" color="primary" />
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Proposal #2: Issue certificate 102</Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ArrowDownwardIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "90%",
              }}
            >
              <Typography>
                <b>Proposal ID: </b>
                40113249118907347497846265566344225737199931284307161947685216366528597413334
              </Typography>
              <Chip label="Success" color="primary" />
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Proposal #3: Issue certificate 104</Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ArrowDownwardIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "90%",
              }}
            >
              <Typography>
                <b>Proposal ID: </b>
                40113249118907347497846265566344225737199931284307161947685216366528597413334
              </Typography>
              <Chip label="Success" color="primary" />
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Proposal #4: Issue certificate 104</Typography>
          </AccordionDetails>
        </Accordion>
      </div>
      <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const email = formJson.email;
            console.log(email);
            handleClose();
          },
        }}
      >
        <DialogTitle>New Proposal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the details for a new proposal
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="Details of the Function to Execute"
            type="email"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="Address of the contract"
            type="email"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="Description"
            type="email"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
    </>
  );
}

export default App;
