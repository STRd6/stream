A table template to render rows from stuff!

    %table
      %thead
        %tr
          - each @headers, (header) ->
            %th= header
      %tbody
        - each @rows, (row) ->
          %tr
            - Object.keys(row).each (name) ->
              %td= row[name]
