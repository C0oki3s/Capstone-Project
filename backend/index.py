import numpy as np
import pandas as pd
import time
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib import gridspec
import pandas as pd # data processing
import numpy as np # working with arrays
import matplotlib.pyplot as plt # visualization
from termcolor import colored as cl # text customization
import itertools # advanced tools
from bson.objectid import ObjectId
import json
import boto3
import pymongo
import warnings
warnings.filterwarnings('ignore')

from sklearn.preprocessing import StandardScaler # data normalization
from sklearn.model_selection import train_test_split # data split
from sklearn.neighbors import KNeighborsClassifier # KNN algorithm
from sklearn.linear_model import LogisticRegression # Logistic regression algorithm
from sklearn.ensemble import RandomForestClassifier # Random forest tree algorithm
from xgboost import XGBClassifier # XGBoost algorithm

from sklearn.metrics import confusion_matrix # evaluation metric
from sklearn.metrics import accuracy_score # evaluation metric
from sklearn.metrics import f1_score # evaluation metric
import argparse
import json
import os
from datetime import datetime



def upload_image(filename):
    try: 
        client = boto3.client('s3', region_name='ap-southeast-1')
        client.upload_file(filename, 'ccfd-algorithm', filename)
        return f"https://ccfd-algorithm.s3.{AWS_REGION}.amazonaws.com/{filename}"
    except: 
        data = {"is_done":False,"error":"Error in uploading File"}
        jsondata = json.dumps(data,indent = 4)
        with open("error.json", "w") as outfile:
            outfile.write(jsondata)

            
def logistic_regression():
    lr = LogisticRegression(solver="lbfgs")
    lr.fit(X_train, y_train)
    lr_yhat = lr.predict(X_test)
    lr_matrix = confusion_matrix(y_test, lr_yhat, labels=[0,1])
    lr_cm_plot = plot_confusion_matrix(lr_matrix,classes = ['Non-Default(0)','Default(1)'], 
                                normalize = False, title = 'LogisticRegression')
    plt.rcParams['figure.figsize'] = (6, 6)
    plt.savefig(logisticregression_img)
    aws_file_url  = upload_image(logisticregression_img)
    # plt.show()
    return [accuracy_score(y_test, lr_yhat),f1_score(y_test, lr_yhat),aws_file_url]

def k_nearest_neighbors():
    n = 5
    knn = KNeighborsClassifier(n_neighbors = n)
    knn.fit(X_train, y_train)
    knn_yhat = knn.predict(X_test)
    knn_matrix = confusion_matrix(y_test, knn_yhat, labels = [0, 1])
    
    knn_cm_plot = plot_confusion_matrix(knn_matrix, 
                                    classes = ['Non-Default(0)','Default(1)'], 
                                    normalize = False, title = 'KNN')
    plt.rcParams['figure.figsize'] = (6, 6)
    plt.savefig(knn_img)
    aws_file_url = upload_image(knn_img)
    # plt.show()
    return [accuracy_score(y_test, knn_yhat),f1_score(y_test, knn_yhat),aws_file_url]

def random_forest():
    rf = RandomForestClassifier(max_depth = 4)
    rf.fit(X_train, y_train)
    rf_yhat = rf.predict(X_test)
    rf_matrix = confusion_matrix(y_test, rf_yhat, labels = [0, 1])
    rf_cm_plot = plot_confusion_matrix(rf_matrix, 
                                classes = ['Non-Default(0)','Default(1)'], 
                                normalize = False, title = 'Random Forest Tree')
    plt.rcParams['figure.figsize'] = (6, 6)
    plt.savefig(randomforest_img)
    aws_file_upload = upload_image(randomforest_img)
    # plt.show()
    return [accuracy_score(y_test, rf_yhat),f1_score(y_test, rf_yhat),aws_file_upload]


def xgboost():
    xgb = XGBClassifier(max_depth = 4)
    xgb.fit(X_train, y_train)
    xgb_yhat = xgb.predict(X_test)
    xgb_matrix = confusion_matrix(y_test, xgb_yhat, labels = [0, 1])
    xgb_cm_plot = plot_confusion_matrix(xgb_matrix, 
                                classes = ['Non-Default(0)','Default(1)'], 
                                normalize = False, title = 'XGBoost')
    plt.rcParams['figure.figsize'] = (6, 6)
    plt.savefig(xgboost_img)
    aws_file_upload = upload_image(xgboost_img)
    # plt.show()
    return [accuracy_score(y_test, xgb_yhat), f1_score(y_test, xgb_yhat),aws_file_upload]

def plot_confusion_matrix(cm, classes, title, normalize = False, cmap = plt.cm.Blues):
    title = 'Confusion Matrix of {}'.format(title)
    if normalize:
        cm = cm.astype(float) / cm.sum(axis=1)[:, np.newaxis]

    plt.imshow(cm, interpolation = 'nearest', cmap = cmap)
    plt.title(title)
    plt.colorbar()
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation = 45)
    plt.yticks(tick_marks, classes)

    fmt = '.2f' if normalize else 'd'
    thresh = cm.max() / 2.
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        plt.text(j, i, format(cm[i, j], fmt),
                 horizontalalignment = 'center',
                 color = 'white' if cm[i, j] > thresh else 'black')

    plt.tight_layout()
    plt.ylabel('True label')
    plt.xlabel('Predicted label')

plt.rcParams['figure.figsize'] = (6, 6)


if __name__ == "__main__":
    start_time = time.time()
    FUNCTION_MAP = {'logistic_regression' : logistic_regression,
                'k_nearest_neighbors' : k_nearest_neighbors,
                 'random_forest':random_forest,
                 'xgboost':xgboost}

    parser = argparse.ArgumentParser()
    parser.add_argument("-id","--user_id",type=str)
    parser.add_argument("-f","--file_name",type=str)
    parser.add_argument('--command', choices=FUNCTION_MAP.keys())
    args = parser.parse_args()

    xgboost_img = f"{args.user_id}_xgb_cm_plot.png"
    logisticregression_img = f"{args.user_id}_lr_cm_plot.png"
    knn_img = f"{args.user_id}_knn_cm_plot.png"
    randomforest_img = f"{args.user_id}_rf_cm_plot.png"
    myClient = pymongo.MongoClient("127.0.0.1",27017) ## connect pymongo
    database = myClient["creditcard"] ## select database
    collection = database["users"] ## select document
    ObjectInstance = ObjectId(args.user_id) ## ObjectId for mongodb
    data = collection.find_one({"_id": ObjectInstance}) ## fetch data from user id
    filedata = data["file_urls"] ## select file_urls property
    for i in filedata:
            AWS_REGION="ap-southeast-1"
            if i["file_name_hash"] == args.file_name:
                print("File pass")
                data = pd.read_csv(i["url"], engine='python') ## read csv_file from url using pandas module
                data.drop('Time', axis = 1, inplace = True)
                cases = len(data) ## Total number of cases
                nonfraud_count = len(data[data.Class == 0]) ## non_fraud cases which represent Class type 0
                fraud_count = len(data[data.Class == 1]) ## fraud cases which represent Class type 1

                outlierFraction_fraud_percentage = round(fraud_count/nonfraud_count*100, 2) ## number of fraud / nonfraud * 100 

                imbalanced_data_fraction = {"case_count": cases, "non_fraud": nonfraud_count, "fraud_count":fraud_count,"outlierFraction_fraud_percentage": outlierFraction_fraud_percentage} 

                    # 2. Description

                nonfraud_cases = data[data.Class == 0] ## select nonfraud_cases
                fraud_cases = data[data.Class == 1] ## fraud_cases

                imbalanced_data_fraction_descride_fraud = fraud_cases.Amount.describe().to_json()
                imbalanced_data_fraction_descride_nonfraud = nonfraud_cases.Amount.describe().to_json()
                    

## matplotlib

                # data.hist(figsize=(20,20),color='lime')
                # plt.savefig("hist.png")
                X = data.drop('Class', axis = 1).values
                y = data['Class'].values
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 0)

                func = FUNCTION_MAP[args.command]
                data_flow = func()
                print(data_flow[2])
                filename = data_flow[2].split("/")
                os.remove(filename[3])
                data_flow_json = {"accuracy_score":data_flow[0],"f1_score":data_flow[1],"aws_location":data_flow[2], "time_eplicsed": time.time() - start_time}
                data_flow_json_1 = json.dumps(data_flow_json)
                jsondata = json.dumps(imbalanced_data_fraction)
                jsondata = [{"imbalanced_data_fraction":imbalanced_data_fraction},
                {"imbalanced_data_fraction_descride_fraud":json.loads(imbalanced_data_fraction_descride_fraud)}, 
                {"imbalanced_data_fraction_descride_nonfraud":json.loads(imbalanced_data_fraction_descride_nonfraud)},
                {"algodata":json.loads(data_flow_json_1)}]
                with open("data.json", "w") as outfile:
                    outfile.write(json.dumps(jsondata))
            else:
                data = {"is_done":False,"error":"Error in reading File"}
                jsondata = json.dumps(data,indent = 4)
                with open("error.json", "w") as outfile:
                    outfile.write(jsondata)

        
    
