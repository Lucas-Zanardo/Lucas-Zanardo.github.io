varying vec2 v_uv;
varying vec3 v_normal;

void main() {
    v_uv = uv;
    v_normal = normal;

    #include <begin_vertex>
    #include <project_vertex>
}