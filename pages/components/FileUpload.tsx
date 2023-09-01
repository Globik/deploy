// write this code to display percentages file progress dialog

import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "./file-uploader.module.css";
var NID :string = "0";

const FileUploader: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
  //alert(location.hostname);
    const newSocket = new WebSocket("ws://" + location.hostname + ":7000");

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

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const [statusText, setStatusText] = useState("");
  const [fileInputValue, setFileInputValue] = useState("");
  const [processing, setProcessing] = useState(false);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setStatusText("Загружен!");
      sendFileToServer(file);
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
        throw new Error("Invalid Content-Type in response headers");
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
