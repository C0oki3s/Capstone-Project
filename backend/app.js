const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const Algorithm = require("./models/Algorithms");
const User = require("./models/users");
const { execSync } = require("child_process");
const fs = require("fs");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API);

// let templates = {
//   notify: "d-a2a9b19d7cfd40b2b8a68b7ccbb901f3",
// };

const UserId = process.argv[2];
const command = process.argv[3];
let is_database_exists = false;
const file_name = process.argv[4];
let data = [];
let data_1 = [];
let database = [];
var f1_score = "";
var accuracy_score = "";
var email = "";

const getUserData = async (userid) => await User.findById(userid);

const python_script = `python ${process.env.PYTHON_ROOT} -id ${UserId} -f ${file_name} --command ${command}`;

const startAlgorithm = async () => {
  try {
    console.log(python_script);
    await execSync(python_script, { stdio: "inherit" });
    await ReadFile();
  } catch (error) {
    console.log(error);
  }
};

const ReadFile = async () => {
  var data = fs.readFileSync("data.json", { encoding: "utf8", flag: "r" });
  let Parse_data = JSON.parse(data);
  let imbalanced_data_fraction = Parse_data[0]["imbalanced_data_fraction"];
  let imbalanced_data_fraction_descride_fraud =
    Parse_data[1]["imbalanced_data_fraction_descride_fraud"];
  let imbalanced_data_fraction_descride_nonfraud =
    Parse_data[2]["imbalanced_data_fraction_descride_nonfraud"];
  let algodata = Parse_data[3]["algodata"];
  data_1.push({
    imbalanced_data_fraction: imbalanced_data_fraction,
    imbalanced_data_fraction_descride_fraud:
      imbalanced_data_fraction_descride_fraud,
    imbalanced_data_fraction_descride_nonfraud:
      imbalanced_data_fraction_descride_nonfraud,
    algodata: algodata,
  });

  data_1.forEach(
    ({
      imbalanced_data_fraction,
      imbalanced_data_fraction_descride_fraud,
      imbalanced_data_fraction_descride_nonfraud,
      algodata,
    }) => {
      f1_score = algodata.f1_score;
      accuracy_score = algodata.accuracy_score;
      algorithm = database.push({
        algorithm_name: command,
        file_name: file_name,
        command: python_script,
        accuracy_score: algodata.accuracy_score,
        f1_score: algodata.f1_score,
        imbalanced_data_fraction: imbalanced_data_fraction,
        imbalanced_data_fraction_descride_fraud:
          imbalanced_data_fraction_descride_fraud,
        imbalanced_data_fraction_descride_nonfraud:
          imbalanced_data_fraction_descride_nonfraud,
        aws_location: algodata.aws_location,
        time_eplicsed: algodata.time_eplicsed,
      });
    }
  );
};

const SaveAndUpdate = async () => {
  try {
    if (is_database_exists) {
      const is_res = await Algorithm.findOneAndUpdate(
        { user_id: UserId },
        {
          $push: {
            algorithm: {
              algorithm_name: database[0].algorithm_name,
              file_name: database[0].file_name,
              command: database[0].command,
              accuracy_score: database[0].accuracy_score,
              f1_score: database[0].f1_score,
              imbalanced_data_fraction: database[0].imbalanced_data_fraction,
              imbalanced_data_fraction_descride_fraud:
                database[0].imbalanced_data_fraction_descride_fraud,
              imbalanced_data_fraction_descride_nonfraud:
                database[0].imbalanced_data_fraction_descride_nonfraud,
              aws_location: database[0].aws_location,
              time_eplicsed: database[0].time_eplicsed,
            },
          },
        }
      );
      await getUserData(UserId).then((userinfo) => {
        email = userinfo?.email;
      });

      const msg = {
        to: email,
        from: process.env.EMAIL,
        templateId: process.env.templateId,
        dynamic_template_data: {
          algorithm: command,
          file_name: file_name,
          algorithm_accuracy: accuracy_score,
          f1_score: f1_score,
        },
      };
      console.log(msg);
      await sgMail.send(msg, (error, result) => {
        if (error) {
          console.log(error, error.body);
        } else {
          console.log("true mail sent");
        }
      });
    } else {
      let response_s = await Algorithm.insertMany({
        user_id: UserId,
        algorithm: {
          algorithm_name: database[0].algorithm_name,
          file_name: database[0].file_name,
          command: database[0].command,
          accuracy_score: database[0].accuracy_score,
          f1_score: database[0].f1_score,
          imbalanced_data_fraction: database[0].imbalanced_data_fraction,
          imbalanced_data_fraction_descride_fraud:
            database[0].imbalanced_data_fraction_descride_fraud,
          imbalanced_data_fraction_descride_nonfraud:
            database[0].imbalanced_data_fraction_descride_nonfraud,
          aws_location: database[0].aws_location,
          time_eplicsed: database[0].time_eplicsed,
        },
      });
      console.log(response_s);
    }
    await getUserData(UserId).then((userinfo) => {
      email = userinfo?.email;
    });
    const msg = {
      to: email,
      from: process.env.EMAIL,
      templateId: process.env.templateId,
      dynamic_template_data: {
        algorithm: command,
        file_name: file_name,
        algorithm_accuracy: accuracy_score,
        f1_score: f1_score,
      },
    };
    console.log(msg);
    await sgMail.send(msg, (error, result) => {
      if (error) {
        console.log(error, error.body);
      } else {
        console.log("true mail sent");
      }
    });
  } catch (error) {
    console.log(error);
  }
};

function algoExists(algorithm, command) {
  return algorithm.some(function (el) {
    return el.algorithm_name === command;
  });
}

async function main() {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI)
      .then(async () => {
        const getUserInfo = await Algorithm.findOne({ user_id: UserId });
        if (getUserInfo == null) {
          console.log(`Starting ${command}`);
          await startAlgorithm();
          console.log(`Save and Update`);
          await SaveAndUpdate();
          process.exit(0);
        } else {
          const { algorithm } = getUserInfo;
          if (algorithm?.length > 0) {
            is_database_exists = true;
          }
          let is_algo_exists = algoExists(algorithm, command);

          if (is_algo_exists) {
            console.log("algorithm already Exist");
            process.exit(0);
          } else {
            console.log(`Starting ${command}`);
            await startAlgorithm();
            console.log(`Save and Update`);
            await SaveAndUpdate();
            process.exit(0);
          }
        }
      })
      .catch((err) => console.log(err));
  } catch (error) {}
}

main();
