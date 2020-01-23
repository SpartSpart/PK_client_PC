package ru.spart.password_keeper_web.ui.views;

import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.springframework.beans.factory.annotation.Autowired;
import ru.spart.password_keeper_web.model.Secret;
import ru.spart.password_keeper_web.service.SecretService;

import java.util.List;

@Route(value = GridView.ROUTE)
@PageTitle("Grid")
public class GridView extends VerticalLayout {
    public static final String ROUTE = "grid";


    private SecretService secretService;

    private Grid<Secret> secretGrid = new Grid<>(Secret.class);

    @Autowired
    public GridView(SecretService secretService){
        this.secretService = secretService;


        add(secretGrid);
        fillGrid();

    }

    private void fillGrid() {
        List<Secret> secretList = secretService.getAllSecrets();
        secretGrid.setItems(secretList);
    }


}
