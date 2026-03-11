#!/usr/bin/env nu

# Blog pipeline management tool
def main [] {
    help main
}

# Show all articles grouped by pipeline stage
def "main ls" [] {
    let stages = [STUB RAW_RECORDING AI_PLAN HUMAN_PLAN AI_DRAFT FINAL]

    let articles = (
        glob articles/*.md
        | each {|f|
            let content = open $f
            let frontmatter = $content | parse --regex '(?s)^---\n(.+?)\n---' | get capture0? | first
            let stage = $frontmatter | parse --regex 'stage:\s*(\S+)' | get capture0? | first | default "UNKNOWN"
            let title = $frontmatter | parse --regex 'title:\s*(.+)' | get capture0? | first | default ($f | path basename | str replace '.md' '')
            { slug: ($f | path basename | str replace '.md' ''), title: $title, stage: $stage }
        }
    )

    let stage_colors = {
        STUB: "grey"
        RAW_RECORDING: "red"
        AI_PLAN: "purple"
        HUMAN_PLAN: "cyan"
        AI_DRAFT: "blue"
        FINAL: "green"
        UNKNOWN: "yellow"
    }

    let all_groups = $stages | append "UNKNOWN"
    for stage in $all_groups {
        let group = $articles | where stage == $stage
        if ($group | length) > 0 {
            let color = $stage_colors | get $stage
            for a in $group {
                print $"($a.slug) (ansi $color)($a.stage)(ansi reset) - ($a.title)"
            }
        }
    }
}
