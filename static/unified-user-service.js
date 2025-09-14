@@ .. @@
   async findAdults() {
     return await this.userService.findAdults();
   }
+
+  async searchUsers(namePattern) {
+    return await this.userService.searchUsers(namePattern);
+  }
+
+  async getUsersPaginated(page = 1, pageSize = 5) {
+    return await this.userService.getUsersPaginated(page, pageSize);
+  }
+
+  async demonstrateDSL() {
+    if (typeof this.userService.repository.select === 'function') {
+      // Complex DSL query demonstration
+      return await this.userService.repository
+        .select()
+        .where('age', '>', 18)
+        .where('name', 'includes', 'a')
+        .orderBy('name', 'asc')
+        .limit(3)
+        .execute();
+    } else {
+      throw new Error('DSL is only available with IndexedDB storage');
+    }
+  }