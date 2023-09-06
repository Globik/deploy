// write this code to display percentages file progress dialog

import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import Script from 'next/script'
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "./file-uploader.module.css";
var NID :string = "0";

const FileUploader: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
  //alert(location.hostname);
   /* const newSocket = new WebSocket("ws://" + location.hostname + ":7000");

    newSocket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if(data.type=="progress"){
      
      var progress = data.progress; // Получаем прогресс из сообщения
      setUploadProgress(progress);
      }else if(data.type=="NID"){
		  NID=data.NID;
		  console.log("initial NID: ", NID);
	  }else{}
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    //setSocket(newSocket);

    return () => {
      newSocket.close();
    };
    */
  }, []);

  const [statusText, setStatusText] = useState("");
  const [fileInputValue, setFileInputValue] = useState("");        

  const [processing, setProcessing] = useState(false);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  const worker = new Worker('worker.js');
  
   worker.addEventListener('message', function(ev){
   ev.stopPropagation();
   ev.preventDefault();
	   //console.log(ev.data);
	   let d=ev.data;
	   if(d.type=="progress"){
	   setProcessing(true);
		   setUploadProgress(d.progress);
	   }else if(d.type == "export"){
		    setStatusText("Файл успешно обработан!");

        const blob = new Blob([d.v], {
          type: "application/octet-stream",
        });
        const fileName = `output_${new Date().toISOString().slice(0, 10)}.xlsx`;

        const url = URL.createObjectURL(blob);
        setDownloadLink(url);
         setProcessing(false);
         worker.terminate();
	   }
   })
  
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
     // setStatusText("Загружен!");
      worker.postMessage({file:file});
      return;
    //  sendFileToServer(file);
    } else {
      console.error("Error: Invalid file type. Please select a .xlsx file.");
    }
  };
  useEffect(() => {
    if (downloadLink) {
      handleDownload();
    }
  }, [downloadLink]);
  const sendFileToServer = async (file: File) => {
    try {
      setProcessing(true);
     setUploadProgress(0);
     // alert(location.hostname);
      const url = "http://" + location.hostname + ":7000/parser";
      let formData = new FormData();
      
      formData.append("upload_file", file);
      formData.append("NID", NID);

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob", // Set the response type to blob
      });

      if (response.headers["content-type"] === "application/octet-stream") {
        setStatusText("Файл успешно обработан!");

        const blob = new Blob([response.data], {
          type: "application/octet-stream",
        });
        const fileName = `output_${new Date().toISOString().slice(0, 10)}.xlsx`;

        const url = URL.createObjectURL(blob);
        setDownloadLink(url);
      } else {
    //  alert(response.status+response.headers["content-type"]+response.data);
   // alert(response.data);
   // alert(JSON.parse(response.data).message);
     // 200application/json; charset=utf-8[object Blob]
       // throw new Error("Invalid Content-Type in response headers");
       if(response.status == 200){
		   setStatusText("Все ресурсы заняты. Пожалуйста, повторите попытку позднее!");
	   }
      }
    } catch (error) {
      console.error("Error uploading file to server:", error);
      setStatusText("Ошибка при загрузке файла");
      setStatusText("Ошибка при загрузке файла");
      setHasError(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleContainerClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDownload = () => {
    if (downloadLink) {
      const downloadLinkElement = document.createElement("a");
      downloadLinkElement.href = downloadLink;
      downloadLinkElement.download = `output_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      downloadLinkElement.click();
    }
  };

  return (
  
    <main className={styles.mainContainer}>
    <Script src="worker.js" />
      <h1>Загрузка базы номеров.</h1>
      <div
        className={styles.fileUploaderContainer}
        id="drop-zone"
        onClick={handleContainerClick}
      >
        {processing ? (
          <div className={styles.spinner}>
            <FontAwesomeIcon icon={faSpinner} size="2x" spin />
          </div>
        ) : (
          <>
            <img
              className={styles.fileUploaderImage}
              id="upload-image"
              src="./images/upload.png"
              alt="Upload"
            />
            <input
              ref={fileInputRef}
              className={styles.fileUploaderInput}
              id="file-input"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              value={fileInputValue}
              disabled={processing}
            />
            <li className={styles.fileUploaderText} id="upload-text">
              загрузите .xlsx файл
            </li>
          </>
        )}
      </div>

      {processing && (
        <div className={styles.processingInfo}>
          <p>Идет обработка... {uploadProgress}%</p>
          <div className={styles.progressContainer}>
            <progress
              className={styles.customProgress}
              value={uploadProgress}
              max={100}
            ></progress>
            <p>После обработки, файл автоматически скачается!</p>
            <p>Пожалуйста, не обновляйте и не перезагружайте страницу!</p>
          </div>{" "}
          <br />
        </div>
      )}

{statusText && !processing && (
  <div className={styles.processingInfo}>
    {hasError ? (
      <p className={styles.errorMessage}>{statusText}</p>
    ) : (
      <>
        <p className={styles.processingSuccess}>{statusText}</p>
        <button className={styles.downloadButton} onClick={handleDownload}>
          Скачать
        </button>
      </>
    )}
  </div>
)}
    </main>
  );
};

export default FileUploader;
