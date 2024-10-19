import ArrayList from "./ArrayList";



class Media {

    static getImageAndVideoCount(targetKeyName,mediaData) {

        let keyName = targetKeyName ? targetKeyName :"file_name"
        let imageCount = 0;
        let videoCount = 0;
    
        const imageExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.bmp']; 
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv']; 
    
        if(ArrayList.isArray(mediaData)){
            mediaData.forEach(item => {
                const extension = item[keyName].split('.').pop().toLowerCase();
        
                if (imageExtensions.includes('.' + extension)) {
                    imageCount++;
                }
                else if (videoExtensions.includes('.' + extension)) {
                    videoCount++;
                }
            });
        }
    
        return { imageCount, videoCount };
    }

    static isVideo  (url)  {
        const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
        const extension = url?.split('.').pop().toLowerCase();
        return videoExtensions.includes(extension);
    };
    
    static isImage (url) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
        const extension = url?.split('.').pop().toLowerCase();
        return imageExtensions.includes(extension) ? true: false;
    };

    static isAudio(url) {
        const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];
        const extension = url?.split('.').pop().toLowerCase();
        return audioExtensions.includes(extension) ? true : false;
    };
    
    
}

export default Media;