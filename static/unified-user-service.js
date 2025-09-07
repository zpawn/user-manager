@@ .. @@
   async deleteUser(id) {
-    await this.repository.delete(id);
+    try {
+      await this.repository.delete(id);
+    } catch (error) {
+      throw new UserUpdateError(`Failed to delete user with id: ${id}`, error);
+    }
   }