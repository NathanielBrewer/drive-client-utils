class DriveUtils {
  baseUrl = 'https://www.googleapis.com/drive/v3';

  async getFilesInDirectory(directoryId, accessToken) {
    let endpointUrl = baseUrl + '/files';
      
    console.log('[drive_getFilesInDirectory(directoryId)] before setting params');
    const params = {
      q: `'${directoryId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name)',
      spaces: 'drive',
    };

    const queryString = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
    console.log('[drive_getFilesInDirectory(directoryId)] queryString:', queryString);
    const url = `${endpointUrl}?${queryString}`;

    try {
      const response = await fetch(
        url,
        {
          method: 'GET',
          headers: { Authorization: "Bearer " + accessToken },
        }
      );
      if(response.status != 200) {
        throw new Error(`[drive_getFilesInDirectory()] error. response:`, response);
      }
      const data = await response.json();
      console.log(`[drive_getFilesInDirectory()]  data returned from drive: ${JSON.stringify(data, null, 2)}`);
      return (!data.files ||  data.files.length === 0) ? null : data.files;

    } catch(error) {
      console.error(`[drive_getFilesInDirectory()] error. Error: ${error.message}`);
    }
  }

  async setPermission(id, options, accessToken) {
    const endpointUrl = baseUrl + `files/${id}/permissions`;
    const body = {
      'role': (options && options.hasOwnProperty('role')) ? options.role : 'reader',
      'type': (options && options.hasOwnProperty('type')) ? options.type : 'anyone'
    };

    try {
      const response = await fetch(
        endpointUrl,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update permissions: ' + response.statusText);
      }
    } catch (error) {
      console.error('[drive_setPermission(id, options)] Error creating link:', error);
    }
  }

  async getLink(id, accessToken) {
    const endpointUrl = baseUrl + `/${id}?fields=webViewLink`;

    try {
      const response = await fetch(
        endpointUrl,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch file link: ' + response.statusText);
      }

      const data = await response.json();
      return data.webViewLink; // This is the link you can use to view the file.
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  // TODO: ResumableUpload
}