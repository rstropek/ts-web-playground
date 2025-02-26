import bpy
import os
import math

# Path to your FBX files
fbx_folder = "F:\kenney\TrainKit\FBX format"
output_folder = "F:\kenney\TrainKit"

# Ensure output folder exists
os.makedirs(output_folder, exist_ok=True)

# Function to clear the scene
def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

# Loop through FBX files in the folder
for fbx_file in os.listdir(fbx_folder):
    if fbx_file.endswith(".fbx"):
        clear_scene()
        
        # Import FBX
        bpy.ops.import_scene.fbx(filepath=os.path.join(fbx_folder, fbx_file))
        if (fbx_file == "railroad-straight.fbx"):
            railroad = bpy.context.selected_objects
            for obj in railroad:
                obj.location=(0, 2, 0)
        
        # Set up a camera
        bpy.ops.object.camera_add(location=(5, -5, 8))
        camera = bpy.context.object
        camera.rotation_euler=(math.radians(45), math.radians(0), math.radians(45))
        camera.data.type = 'ORTHO' # ORTHO
        camera.data.lens = 80
        bpy.context.scene.camera = camera
        
        # Set up light
        bpy.ops.object.light_add(type='SUN', location=(5, -5, 4.2))
        light = bpy.context.object
        light.data.energy = 5
        light.data.angle = 15

        # Set render settings
        bpy.context.scene.render.resolution_x = 480  # Width in pixels
        bpy.context.scene.render.resolution_y = 480  # Height in pixels
        bpy.context.scene.render.resolution_percentage = 100  # Scale (100% = full resolution)
        bpy.context.scene.render.engine = 'CYCLES'  # Change to 'BLENDER_EEVEE' for faster rendering
        bpy.context.scene.render.image_settings.file_format = 'PNG'
        bpy.context.scene.render.filepath = os.path.join(output_folder, fbx_file.replace(".fbx", ".png"))
        
        # Render and save
        bpy.ops.render.render(write_still=True)
        
        break

print("Rendering complete!")
