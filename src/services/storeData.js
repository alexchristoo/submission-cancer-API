const projectId = 'submissionmlgc-christo';
const { Firestore } = require('@google-cloud/firestore');
 
async function storeData(id, data) {
  const db = new Firestore({projectId, });
 
  const predictCollection = db.collection('cancer-db');
  return predictCollection.doc(id).set(data);
}
    
module.exports = storeData;