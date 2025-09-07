@@ .. @@
 import {
   Logger,
   IndexedDBStorage,
   IndexedDBRepository,
   FileSystemStorage,
   FileSystemRepository,
+  StorageError,
+  FileSystemError,
+  IndexedDBError,
 } from './core/index.js';
@@ .. @@
   async initialize() {
-    throw new Error('StorageStrategy.initialize must be implemented');
+    throw new StorageError('StorageStrategy.initialize must be implemented');
   }
@@ .. @@
   getRepository() {
-    throw new Error('StorageStrategy.getRepository must be implemented');
+    throw new StorageError('StorageStrategy.getRepository must be implemented');
   }
@@ .. @@
   async initialize() {
-    this.db = new IndexedDBStorage('UserManager', 1, (db) => {
-      if (!db.objectStoreNames.contains('user')) {
-        db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
-      }
-    });
-    await this.db.connect();
-    this.repository = new IndexedDBRepository(this.db, 'user');
+    try {
+      this.db = new IndexedDBStorage('UserManager', 1, (db) => {
+        if (!db.objectStoreNames.contains('user')) {
+          db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
+        }
+      });
+      await this.db.connect();
+      this.repository = new IndexedDBRepository(this.db, 'user');
+    } catch (error) {
+      throw new IndexedDBError('Failed to initialize IndexedDB strategy', error);
+    }
   }
@@ .. @@
   async initialize() {
-    this.storage = new FileSystemStorage('UserManagerFS');
-    await this.storage.connect();
-    this.repository = new FileSystemRepository(this.storage, 'user');
+    try {
+      this.storage = new FileSystemStorage('UserManagerFS');
+      await this.storage.connect();
+      this.repository = new FileSystemRepository(this.storage, 'user');
+    } catch (error) {
+      throw new FileSystemError('Failed to initialize OPFS strategy', error);
+    }
   }