// // src/lib/vector/qdrant-client.js
// /**
//  * Qdrant Vector Database Client
//  * Handles all vector operations for RAG system
//  */

// import { QdrantClient } from '@qdrant/js-client-rest';

// class QdrantManager {
//   constructor() {
//     this.client = null;
//     this.initialized = false;
//     this.collectionName = process.env.QDRANT_COLLECTION_NAME || 'lunieai_vectors';
//     this.vectorDimension = parseInt(process.env.VECTOR_DIMENSION || '768');
//   }

//   /**
//    * Initialize Qdrant client
//    */
//   async initialize() {
//     if (this.initialized) return this.client;

//     try {
//       // Validate environment variables
//       if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
//         throw new Error('Qdrant configuration missing. Please set QDRANT_URL and QDRANT_API_KEY');
//       }

//       // Initialize client
//       this.client = new QdrantClient({
//         url: process.env.QDRANT_URL,
//         apiKey: process.env.QDRANT_API_KEY,
//       });

//       // Test connection
//       await this.client.getCollections();
      
//       this.initialized = true;
//       console.log('✅ Qdrant client initialized successfully');
      
//       return this.client;
//     } catch (error) {
//       console.error('❌ Failed to initialize Qdrant:', error);
//       throw error;
//     }
//   }

//   /**
//    * Create collection if it doesn't exist
//    */
//   async createCollection(collectionName = null) {
//     const name = collectionName || this.collectionName;
    
//     try {
//       await this.initialize();
      
//       // Check if collection exists
//       const collections = await this.client.getCollections();
//       const exists = collections.collections.some(c => c.name === name);
      
//       if (exists) {
//         console.log(`Collection "${name}" already exists`);
//         return { success: true, existed: true };
//       }

//       // Create new collection
//       await this.client.createCollection(name, {
//         vectors: {
//           size: this.vectorDimension,
//           distance: 'Cosine'
//         },
//         optimizers_config: {
//           default_segment_number: 2
//         },
//         replication_factor: 1
//       });

//       console.log(`✅ Collection "${name}" created successfully`);
//       return { success: true, existed: false };
      
//     } catch (error) {
//       console.error('Failed to create collection:', error);
//       throw error;
//     }
//   }

//   /**
//    * Delete collection
//    */
//   async deleteCollection(collectionName = null) {
//     const name = collectionName || this.collectionName;
    
//     try {
//       await this.initialize();
//       await this.client.deleteCollection(name);
//       console.log(`Collection "${name}" deleted`);
//       return { success: true };
//     } catch (error) {
//       console.error('Failed to delete collection:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get collection info
//    */
//   async getCollectionInfo(collectionName = null) {
//     const name = collectionName || this.collectionName;
    
//     try {
//       await this.initialize();
//       const info = await this.client.getCollection(name);
      
//       return {
//         name: name,
//         vectorsCount: info.vectors_count,
//         pointsCount: info.points_count,
//         config: info.config,
//         status: info.status
//       };
//     } catch (error) {
//       if (error.message?.includes('404')) {
//         return { exists: false };
//       }
//       throw error;
//     }
//   }

//   /**
//    * Create namespace for multi-tenant isolation
//    */
//   createNamespace(userId, chatbotId) {
//     return `user_${userId}_bot_${chatbotId}`;
//   }

//   /**
//    * Generate numeric ID from string
//    */
//   generateNumericId(stringId) {
//     // Convert string to numeric ID using hash
//     let hash = 0;
//     for (let i = 0; i < stringId.length; i++) {
//       const char = stringId.charCodeAt(i);
//       hash = ((hash << 5) - hash) + char;
//       hash = hash & hash; // Convert to 32bit integer
//     }
//     return Math.abs(hash);
//   }

//   /**
//    * Upsert vectors with metadata
//    */
//   async upsertVectors(vectors, namespace = null) {
//     try {
//       await this.initialize();
      
//       // Ensure collection exists
//       await this.createCollection();

//       // Format points for Qdrant (with numeric IDs)
//       const points = vectors.map((v, index) => ({
//         id: v.id && typeof v.id === 'string' ? this.generateNumericId(v.id) : (v.id || Date.now() + index),
//         vector: v.embedding,
//         payload: {
//           ...v.metadata,
//           original_id: v.id, // Store original ID in payload
//           namespace: namespace || 'default',
//           created_at: new Date().toISOString()
//         }
//       }));

//       // Upsert in batches of 100
//       const batchSize = 100;
//       const results = [];
      
//       for (let i = 0; i < points.length; i += batchSize) {
//         const batch = points.slice(i, i + batchSize);
        
//         try {
//           const result = await this.client.upsert(this.collectionName, {
//             wait: true,
//             points: batch
//           });
//           results.push(result);
          
//           console.log(`Upserted batch ${i / batchSize + 1}/${Math.ceil(points.length / batchSize)}`);
//         } catch (batchError) {
//           console.error('Batch upsert error:', batchError);
//           console.error('Batch data:', JSON.stringify(batch[0], null, 2));
          
//           // Check if it's a dimension mismatch
//           if (batchError.message?.includes('dimension') || batchError.status === 400) {
//             console.error(`Vector dimension mismatch. Expected: ${this.vectorDimension}, Got: ${batch[0]?.vector?.length}`);
//             throw new Error(`Vector dimension mismatch. Collection expects ${this.vectorDimension} dimensions, but got ${batch[0]?.vector?.length}`);
//           }
//           throw batchError;
//         }
//       }

//       return {
//         success: true,
//         totalVectors: points.length,
//         batches: results.length
//       };
      
//     } catch (error) {
//       console.error('Failed to upsert vectors:', error);
//       throw error;
//     }
//   }

//   /**
//    * Search similar vectors
//    */
//   async searchVectors(queryVector, options = {}) {
//     const {
//       namespace = null,
//       limit = 5,
//       scoreThreshold = 0.7,
//       filter = {}
//     } = options;

//     try {
//       await this.initialize();

//       // Build filter
//       const searchFilter = {
//         must: []
//       };

//       if (namespace) {
//         searchFilter.must.push({
//           key: 'namespace',
//           match: { value: namespace }
//         });
//       }

//       // Add custom filters
//       Object.entries(filter).forEach(([key, value]) => {
//         searchFilter.must.push({
//           key,
//           match: { value }
//         });
//       });

//       // Perform search
//       const searchResult = await this.client.search(this.collectionName, {
//         vector: queryVector,
//         limit,
//         score_threshold: scoreThreshold,
//         filter: searchFilter.must.length > 0 ? searchFilter : undefined,
//         with_payload: true,
//         with_vector: false
//       });

//       // Format results
//       return searchResult.map(result => ({
//         id: result.id,
//         score: result.score,
//         metadata: result.payload
//       }));
      
//     } catch (error) {
//       console.error('Search failed:', error);
//       throw error;
//     }
//   }

//   /**
//    * Delete vectors by filter
//    */
  // async deleteVectors(filter) {
  //   try {
  //     await this.initialize();

  //     const deleteFilter = {
  //       must: Object.entries(filter).map(([key, value]) => ({
  //         key,
  //         match: { value }
  //       }))
  //     };

  //     const result = await this.client.delete(this.collectionName, {
  //       wait: true,
  //       filter: deleteFilter
  //     });

  //     return {
  //       success: true,
  //       ...result
  //     };
      
  //   } catch (error) {
  //     console.error('Failed to delete vectors:', error);
  //     throw error;
  //   }
  // }

//   /**
//    * Update vector metadata
//    */
//   async updateVectorMetadata(vectorId, metadata) {
//     try {
//       await this.initialize();

//       await this.client.setPayload(this.collectionName, {
//         payload: {
//           ...metadata,
//           updated_at: new Date().toISOString()
//         },
//         points: [vectorId]
//       });

//       return { success: true };
      
//     } catch (error) {
//       console.error('Failed to update metadata:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get statistics
//    */
//   async getStats() {
//     try {
//       await this.initialize();
      
//       const collections = await this.client.getCollections();
//       const collectionInfo = await this.getCollectionInfo();
      
//       return {
//         connected: true,
//         collections: collections.collections.length,
//         currentCollection: collectionInfo,
//         timestamp: new Date().toISOString()
//       };
//     } catch (error) {
//       return {
//         connected: false,
//         error: error.message
//       };
//     }
//   }

//   /**
//    * Health check
//    */
//   async healthCheck() {
//     try {
//       await this.initialize();
//       const result = await this.client.getCollections();
//       return {
//         healthy: true,
//         collections: result.collections.length
//       };
//     } catch (error) {
//       return {
//         healthy: false,
//         error: error.message
//       };
//     }
//   }
// }

// // Singleton instance
// let instance = null;

// export const getQdrantManager = () => {
//   if (!instance) {
//     instance = new QdrantManager();
//   }
//   return instance;
// };

// export default QdrantManager;

// src/lib/vector/qdrant-client.js
/**
 * Qdrant Vector Database Client
 * Handles all vector operations for RAG system (multi-tenant support)
 */

import { QdrantClient } from '@qdrant/js-client-rest';

class QdrantManager {
  constructor() {
    this.client = null;
    this.initialized = false;

    // Default configs
    this.collectionName = process.env.QDRANT_COLLECTION_NAME || 'lunieai_vectors';
    this.vectorDimension = parseInt(process.env.VECTOR_DIMENSION || '768', 10);
  }

  /**
   * Initialize Qdrant client (singleton)
   */
  async initialize() {
    if (this.initialized) return this.client;

    if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
      throw new Error('Missing Qdrant configuration: QDRANT_URL or QDRANT_API_KEY not set');
    }

    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });

    try {
      await this.client.getCollections(); // health check
      this.initialized = true;
      console.log('✅ Qdrant client initialized');
      return this.client;
    } catch (error) {
      console.error('❌ Failed to connect to Qdrant:', error.message);
      throw error;
    }
  }

  /**
   * Create collection if not exists
   */
  async createCollection(name = this.collectionName) {
    await this.initialize();

    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === name);

      if (exists) {
        console.log(`ℹ️ Collection "${name}" already exists`);
        return { success: true, existed: true };
      }

      await this.client.createCollection(name, {
        vectors: {
          size: this.vectorDimension,
          distance: 'Cosine',
        },
        optimizers_config: { default_segment_number: 2 },
        replication_factor: 1,
      });

      console.log(`✅ Collection "${name}" created`);
      return { success: true, existed: false };
    } catch (error) {
      console.error(`❌ Failed to create collection "${name}":`, error.message);
      throw error;
    }
  }

  /**
   * Delete collection
   */
  async deleteCollection(name = this.collectionName) {
    await this.initialize();
    try {
      await this.client.deleteCollection(name);
      console.log(`🗑️ Collection "${name}" deleted`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to delete collection "${name}":`, error.message);
      throw error;
    }
  }

  /**
   * Get collection info
   */
  async getCollectionInfo(name = this.collectionName) {
    await this.initialize();
    try {
      const info = await this.client.getCollection(name);
      return {
        exists: true,
        name,
        vectorsCount: info.vectors_count,
        pointsCount: info.points_count,
        config: info.config,
        status: info.status,
      };
    } catch (error) {
      if (error.message?.includes('404')) return { exists: false };
      throw error;
    }
  }

  /**
   * Namespace for multi-tenant isolation
   */
  createNamespace(userId, chatbotId) {
    return `user_${userId}_bot_${chatbotId}`;
  }

  /**
   * Convert string to deterministic numeric ID (for Qdrant)
   */
  generateNumericId(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // force 32-bit
    }
    return Math.abs(hash);
  }

  /**
   * Upsert vectors with metadata into collection
   */
  async upsertVectors(vectors, namespace = 'default', name = this.collectionName) {
    await this.initialize();
    await this.createCollection(name);

    if (!Array.isArray(vectors) || vectors.length === 0) {
      throw new Error('No vectors provided for upsert');
    }

    const points = vectors.map((v, index) => ({
      id: typeof v.id === 'string'
        ? this.generateNumericId(v.id)
        : v.id || Date.now() + index,
      vector: v.embedding,
      payload: {
        ...v.metadata,
        original_id: v.id,
        namespace,
        created_at: new Date().toISOString(),
      },
    }));

    // Batch insert for scalability
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      try {
        const result = await this.client.upsert(name, {
          wait: true,
          points: batch,
        });
        results.push(result);
        console.log(`⬆️ Upserted batch ${i / batchSize + 1}/${Math.ceil(points.length / batchSize)}`);
      } catch (err) {
        if (err.message?.includes('dimension')) {
          console.error(`❌ Vector dimension mismatch: Expected ${this.vectorDimension}, got ${batch[0]?.vector?.length}`);
        }
        throw err;
      }
    }

    return { success: true, totalVectors: points.length, batches: results.length };
  }

  /**
   * Search vectors by similarity
   */
  async searchVectors(queryVector, { namespace, limit = 5, scoreThreshold = 0.7, filter = {}, name = this.collectionName } = {}) {
    await this.initialize();

    const searchFilter = { must: [] };
    if (namespace) searchFilter.must.push({ key: 'namespace', match: { value: namespace } });

    Object.entries(filter).forEach(([key, value]) => {
      searchFilter.must.push({ key, match: { value } });
    });

    const results = await this.client.search(name, {
      vector: queryVector,
      limit,
      score_threshold: scoreThreshold,
      filter: searchFilter.must.length ? searchFilter : undefined,
      with_payload: true,
      with_vector: false,
    });

    return results.map(r => ({
      id: r.id,
      score: r.score,
      metadata: r.payload,
    }));
  }

  /**
   * Delete vectors by filter
   */
  // async deleteVectors(filter, name = this.collectionName) {
  //   await this.initialize();
  //   try {
  //     const deleteFilter = {
  //       must: Object.entries(filter).map(([key, value]) => ({
  //         key,
  //         match: { value },
  //       })),
  //     };
  //     const result = await this.client.delete(name, { wait: true, filter: deleteFilter });
  //     return { success: true, ...result };
  //   } catch (error) {
  //     console.error('❌ Failed to delete vectors:', error.message);
  //     throw error;
  //   }
  // }

   async deleteVectors(filter) {
    try {
      await this.initialize();

      // ✅ CORRECT: Based on Pipedream example and official docs
      // The JavaScript client expects { points: ids } OR { filter: filterObject }
      
      const result = await this.client.delete(this.collectionName, {
        filter: {
          must: Object.entries(filter).map(([key, value]) => ({
            key: key,
            match: {
              value: value
            }
          }))
        },
        wait: true
      });

      console.log("✅ Delete successful:", result);
      return { success: true, result };

    } catch (error) {
      console.error('❌ Failed to delete vectors:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        filter: filter
      });
      
      return { 
        success: false, 
        error: error.message,
        details: error.response?.data 
      };
    }
  }

  // ✅ ALTERNATIVE: Delete by exact point IDs (when filter fails)
  async deleteVectorsByIds(pointIds) {
    try {
      await this.initialize();

      console.log(`🎯 Deleting ${pointIds.length} points by ID:`, pointIds);

      const result = await this.client.delete(this.collectionName, {
        points: pointIds,  // Array of point IDs
        wait: true
      });

      console.log("✅ Delete by IDs successful:", result);
      return { success: true, result };

    } catch (error) {
      console.error('❌ Delete by IDs failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ✅ ROBUST: Try everything
  async deleteVectorsRobust(filter) {
    try {
      console.log('🎯 Starting robust deletion for filter:', filter);

      // Strategy 1: Direct filter deletion
      console.log('📍 Strategy 1: Filter-based deletion');
      const filterResult = await this.deleteVectors(filter);
      
      if (filterResult.success) {
        console.log('✅ Filter deletion successful');
        return filterResult;
      }

      console.log('⚠️ Filter deletion failed, finding point IDs...');

      // Strategy 2: Get actual point IDs and delete them
      const pointIds = await this.findPointIds(filter);
      
      if (pointIds.length === 0) {
        console.log('⚠️ No points found with filter:', filter);
        
        // Strategy 3: Try broader search - maybe just by trainingDataId
        if (filter.trainingDataId) {
          console.log('📍 Strategy 3: Search by trainingDataId only');
          const allPoints = await this.findAllPoints();
          const matchingIds = allPoints.filter(p => 
            p.payload?.trainingDataId === filter.trainingDataId
          ).map(p => p.id);
          
          if (matchingIds.length > 0) {
            console.log(`🔍 Found ${matchingIds.length} matching points manually`);
            return await this.deleteVectorsByIds(matchingIds);
          }
        }
        
        return { success: false, error: 'No points found matching filter' };
      }

      console.log(`📍 Strategy 2: Deleting ${pointIds.length} points by ID`);
      return await this.deleteVectorsByIds(pointIds);

    } catch (error) {
      console.error('❌ Robust deletion completely failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ✅ HELPER: Find point IDs using scroll
  async findPointIds(filter) {
    try {
      await this.initialize();

      console.log('🔍 Searching for points with filter:', filter);

      const scrollResult = await this.client.scroll(this.collectionName, {
        filter: {
          must: Object.entries(filter).map(([key, value]) => ({
            key: key,
            match: { value: value }
          }))
        },
        limit: 1000,
        with_payload: false,
        with_vector: false
      });

      const pointIds = scrollResult.points ? scrollResult.points.map(point => point.id) : [];
      console.log(`🔍 Found ${pointIds.length} matching points via scroll`);
      
      return pointIds;

    } catch (error) {
      console.error('❌ Find point IDs via scroll failed:', error.message);
      return [];
    }
  }

  // ✅ HELPER: Get all points to manually filter (last resort)
  async findAllPoints() {
    try {
      await this.initialize();

      console.log('🔍 Getting all points for manual filtering...');

      const scrollResult = await this.client.scroll(this.collectionName, {
        limit: 1000,
        with_payload: true,
        with_vector: false
      });

      const points = scrollResult.points || [];
      console.log(`🔍 Retrieved ${points.length} total points`);
      
      return points;

    } catch (error) {
      console.error('❌ Get all points failed:', error.message);
      return [];
    }
  }

  // ✅ WORKING EXAMPLE: Test with your exact data
  async testDelete(trainingDataId) {
    console.log(`🧪 Testing deletion for trainingDataId: ${trainingDataId}`);
    
    // Check what exists first
    const allPoints = await this.findAllPoints();
    const matchingPoints = allPoints.filter(p => 
      p.payload?.trainingDataId === trainingDataId
    );
    
    console.log(`🔍 Found ${matchingPoints.length} points to delete:`, 
      matchingPoints.map(p => ({ id: p.id, trainingDataId: p.payload?.trainingDataId }))
    );
    
    if (matchingPoints.length === 0) {
      return { success: false, error: 'No matching points found' };
    }
    
    // Delete by IDs (most reliable)
    const pointIds = matchingPoints.map(p => p.id);
    return await this.deleteVectorsByIds(pointIds);
  }
  /**
   * Update metadata of a vector
   */
  async updateVectorMetadata(vectorId, metadata, name = this.collectionName) {
    await this.initialize();
    try {
      await this.client.setPayload(name, {
        payload: { ...metadata, updated_at: new Date().toISOString() },
        points: [vectorId],
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to update vector metadata:', error.message);
      throw error;
    }
  }

  /**
   * Stats summary
   */
  async getStats() {
    await this.initialize();
    try {
      const collections = await this.client.getCollections();
      const info = await this.getCollectionInfo();
      return {
        connected: true,
        collections: collections.collections.length,
        currentCollection: info,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.initialize();
      const result = await this.client.getCollections();
      return { healthy: true, collections: result.collections.length };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}

// Singleton instance
let instance = null;
export const getQdrantManager = () => {
  if (!instance) instance = new QdrantManager();
  return instance;
};
export default QdrantManager;
